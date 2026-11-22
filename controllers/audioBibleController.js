const AudioBible = require('../models/AudioBible');
const bookMapping = require('../utils/bookMapping');

/**
 * GET /api/audio-bible/:lang/:book/:chapter
 * 
 * Returns the audio URL for a specific book and chapter.
 * Supports lookup by book name, abbreviation, or book index.
 */
exports.getAudioChapter = async (req, res) => {
    try {
        const { lang, book, chapter } = req.params;
        const chapterNum = parseInt(chapter, 10);

        if (!chapterNum || chapterNum < 1) {
            return res.status(400).json({ error: 'Invalid chapter number' });
        }

        // Build query - try multiple lookup strategies
        let query = { language: lang, chapter: chapterNum };

        // Try by book index (numeric)
        if (!isNaN(book)) {
            query.bookId = parseInt(book, 10);
        } else {
            // Try by book name or abbreviation
            const mapping = bookMapping.find(b =>
                b.name.toLowerCase() === book.toLowerCase() ||
                b.abbrev.toLowerCase() === book.toLowerCase()
            );

            if (mapping) {
                // Use bookId (index + 1 since audio uses 1-based bookId)
                query.bookId = mapping.index + 1;
            } else {
                // Fallback: try direct book name match in DB
                query.book = new RegExp(`^${book}$`, 'i');
            }
        }

        const audio = await AudioBible.findOne(query).lean();

        if (!audio) {
            return res.status(404).json({ error: 'Audio not found for this chapter' });
        }

        res.json({
            book: audio.book,
            chapter: audio.chapter,
            audioUrl: audio.audioUrl,
            bookId: audio.bookId,
            language: audio.language
        });
    } catch (error) {
        console.error('getAudioChapter error:', error);
        res.status(500).json({ error: 'Failed to fetch audio chapter' });
    }
};

/**
 * GET /api/audio-bible/:lang/books
 * 
 * Returns a list of all books that have audio available for the given language.
 */
exports.getAudioBooks = async (req, res) => {
    try {
        const { lang } = req.params;

        const books = await AudioBible.aggregate([
            { $match: { language: lang } },
            {
                $group: {
                    _id: '$bookId',
                    book: { $first: '$book' },
                    chapters: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(books.map(b => ({
            bookId: b._id,
            book: b.book,
            chaptersAvailable: b.chapters
        })));
    } catch (error) {
        console.error('getAudioBooks error:', error);
        res.status(500).json({ error: 'Failed to fetch audio books list' });
    }
};
