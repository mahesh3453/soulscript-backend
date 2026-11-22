/**
 * uploadMarathiAudioBible.js
 * 
 * Automated pipeline to:
 * 1. Scan all MP3 files from D:\Marathi_Audio
 * 2. Parse metadata (bookId, book name, chapter) from filenames
 * 3. Upload each to Cloudinary (resource_type: "video", folder: "marathi-audio-bible")
 * 4. Store the record in MongoDB via the AudioBible model
 * 5. Skip duplicates (same language + bookId + chapter)
 * 6. Resume safely if interrupted
 * 
 * Usage:  node scripts/uploadMarathiAudioBible.js
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load env from server root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const AudioBible = require('../models/AudioBible');

// ── Config ──────────────────────────────────────────────────────
const AUDIO_DIR = 'D:\\Marathi_Audio';
const CLOUDINARY_FOLDER = 'marathi-audio-bible';
const LANGUAGE = 'mr';

// Book name mapping: the filenames use long names like "The_Book_Of_Genesis"
// We need to extract just the core book name for storage.
const bookNameExtract = (rawName) => {
    // Examples:
    //   "The_Book_Of_Genesis"         → "Genesis"
    //   "The_Book_Of_1_Samuel"        → "1 Samuel"
    //   "The_Book_Of_Song_Of_Solomon" → "Song of Solomon"
    //   "The_Book_Of_1_Corinthians"   → "1 Corinthians"
    //   "The_Book_Of_Revelation"      → "Revelation"
    
    let name = rawName.replace(/_/g, ' ');
    
    // Remove common prefixes
    const prefixes = [
        'The Book Of ',
        'The First Book Of ',
        'The Second Book Of ',
        'The Third Book Of ',
        'The Epistle Of Paul The Apostle To The ',
        'The Epistle Of Paul To The ',
        'The Epistle Of ',
        'The Gospel According To ',
        'The Acts Of The Apostles',
        'The Lamentations Of Jeremiah',
    ];
    
    for (const prefix of prefixes) {
        if (name.startsWith(prefix)) {
            name = name.substring(prefix.length);
            break;
        }
    }
    
    return name.trim() || rawName.replace(/_/g, ' ');
};

// ── Filename Parser ─────────────────────────────────────────────
// Pattern: BBCCC-<BookName>_Chapter-CCC.mp3
// BB = 2-digit book id (01-66)
// CCC = 3-digit chapter number
const parseFilename = (filename) => {
    // Match: digits at start, then separator, then book name, then Chapter-digits
    const match = filename.match(/^(\d{2})(\d{3})-(.+?)_Chapter-(\d{3})\.mp3$/i);
    if (!match) return null;

    const bookId = parseInt(match[1], 10);     // 01 → 1, 66 → 66
    const chapterFromCode = parseInt(match[2], 10);
    const rawBookName = match[3];
    const chapterFromSuffix = parseInt(match[4], 10);

    // Use the suffix chapter number (more explicit)
    const chapter = chapterFromSuffix || chapterFromCode;
    const book = bookNameExtract(rawBookName);

    return { bookId, book, chapter };
};

// ── Main Upload Pipeline ────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('   Marathi Audio Bible Upload Pipeline');
    console.log('═══════════════════════════════════════════════════════\n');

    // 1. Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected.\n');

    // 2. Verify Cloudinary credentials
    console.log('☁️  Cloudinary Cloud:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('');

    // 3. Scan audio directory
    if (!fs.existsSync(AUDIO_DIR)) {
        console.error(`❌ Audio directory not found: ${AUDIO_DIR}`);
        process.exit(1);
    }

    const allFiles = fs.readdirSync(AUDIO_DIR)
        .filter(f => f.toLowerCase().endsWith('.mp3'))
        .sort();

    console.log(`📂 Found ${allFiles.length} MP3 files in ${AUDIO_DIR}\n`);

    // 4. Process each file
    let uploaded = 0;
    let skipped = 0;
    let failed = 0;
    const errors = [];

    for (let i = 0; i < allFiles.length; i++) {
        const filename = allFiles[i];
        const filePath = path.join(AUDIO_DIR, filename);

        // Parse metadata from filename
        const meta = parseFilename(filename);
        if (!meta) {
            console.log(`⚠️  [${i + 1}/${allFiles.length}] Skipping unrecognized file: ${filename}`);
            failed++;
            errors.push({ file: filename, reason: 'Filename parse failed' });
            continue;
        }

        const { bookId, book, chapter } = meta;

        // Check for existing record (resume-safe / duplicate prevention)
        const existing = await AudioBible.findOne({
            language: LANGUAGE,
            bookId,
            chapter
        });

        if (existing) {
            console.log(`⏭️  [${i + 1}/${allFiles.length}] Already exists: ${book} Chapter ${chapter}`);
            skipped++;
            continue;
        }

        // Upload to Cloudinary
        try {
            const publicId = `${CLOUDINARY_FOLDER}/${LANGUAGE}_${String(bookId).padStart(2, '0')}_${String(chapter).padStart(3, '0')}`;
            
            console.log(`📤 [${i + 1}/${allFiles.length}] Uploading: ${book} Chapter ${chapter}...`);

            const result = await cloudinary.uploader.upload(filePath, {
                resource_type: 'video',     // Cloudinary uses 'video' for audio files
                folder: CLOUDINARY_FOLDER,
                public_id: `${LANGUAGE}_${String(bookId).padStart(2, '0')}_${String(chapter).padStart(3, '0')}`,
                overwrite: false,
                format: 'mp3'
            });

            // Save to MongoDB
            await AudioBible.create({
                language: LANGUAGE,
                bookId,
                book,
                chapter,
                audioUrl: result.secure_url,
                publicId: result.public_id
            });

            console.log(`✅ Uploaded: ${book} Chapter ${chapter}`);
            uploaded++;

        } catch (err) {
            // Handle Cloudinary "already exists" error gracefully
            if (err.http_code === 409 || (err.message && err.message.includes('already exists'))) {
                console.log(`⏭️  [${i + 1}/${allFiles.length}] Cloudinary duplicate: ${book} Chapter ${chapter}`);
                skipped++;
            } else {
                console.error(`❌ [${i + 1}/${allFiles.length}] Failed: ${book} Chapter ${chapter} — ${err.message}`);
                failed++;
                errors.push({ file: filename, book, chapter, reason: err.message });
            }
        }
    }

    // 5. Print summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('                  UPLOAD SUMMARY');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`   Total Files Found:  ${allFiles.length}`);
    console.log(`   Uploaded:           ${uploaded}`);
    console.log(`   Skipped (existing): ${skipped}`);
    console.log(`   Failed:             ${failed}`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (errors.length > 0) {
        console.log('Errors:');
        errors.forEach(e => console.log(`  - ${e.file}: ${e.reason}`));
        console.log('');
    }

    // 6. Verify final DB count
    const dbCount = await AudioBible.countDocuments({ language: LANGUAGE });
    console.log(`📊 Total Marathi audio records in DB: ${dbCount}\n`);

    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected. Done.');
    process.exit(0);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
