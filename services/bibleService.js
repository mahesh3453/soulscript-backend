const fs = require('fs');
const path = require('path');
const moodMapping = require('../utils/moodMapping');
const bookMapping = require('../utils/bookMapping');

class BibleService {
    constructor() {
        this.bibleData = null;
        this.loadBible();
    }

    loadBible() {
        try {
            const readJSON = (fileName) => {
                const filePath = path.join(__dirname, '../data', fileName);
                let rawData = fs.readFileSync(filePath, 'utf8');
                if (rawData.charCodeAt(0) === 0xFEFF) {
                    rawData = rawData.slice(1);
                }
                return JSON.parse(rawData);
            };

            const enBBE = readJSON('en_bbe.json');
            const enKJV = readJSON('en_kjv.json');
            const hiData = readJSON('hi.json');

            const reverseMoodMap = {};
            for (const [mood, verses] of Object.entries(moodMapping)) {
                verses.forEach(v => {
                    const key = `${v.bookIdx}_${v.chapter}_${v.verse}`;
                    reverseMoodMap[key] = mood.toLowerCase();
                });
            }

            this.moodIndex = { none: [], happy: [], sad: [], anxiety: [], peace: [], motivation: [], fear: [], hope: [], gratitude: [], loneliness: [], strength: [], faith: [], healing: [] };

            // Structure into efficient lookup array
            this.bibleData = bookMapping.map((mapping, bIdx) => {
                const bbeBook = enBBE[bIdx] ? enBBE[bIdx].chapters : [];
                const kjvBook = enKJV[bIdx] ? enKJV[bIdx].chapters : [];
                const hiBook = (hiData.Book && hiData.Book[bIdx]) ? hiData.Book[bIdx].Chapter : [];

                const chapters = [];
                const maxChapters = Math.max(bbeBook.length, kjvBook.length, hiBook.length);

                for (let c = 0; c < maxChapters; c++) {
                    const bbeChap = bbeBook[c] || [];
                    const kjvChap = kjvBook[c] || [];
                    const hiChap = hiBook[c] ? hiBook[c].Verse : [];
                    
                    const verses = [];
                    const maxVerses = Math.max(bbeChap.length, kjvChap.length, hiChap.length);
                    
                    for (let v = 0; v < maxVerses; v++) {
                        const text_bbe = bbeChap[v] || "";
                        const text_kjv = kjvChap[v] || "";
                        let text_hi = "";
                        
                        if (hiChap[v] && hiChap[v].Verse) {
                            text_hi = hiChap[v].Verse;
                        } else {
                            // Fallback to English BBE if Hindi is missing
                            text_hi = text_bbe;
                        }

                        const moodKey = `${bIdx}_${c + 1}_${v + 1}`;
                        const mood = reverseMoodMap[moodKey] || "none";

                        const verseObj = {
                            text_bbe,
                            text_kjv,
                            text_hi,
                            mood
                        };

                        verses.push(verseObj);

                        if (mood !== "none") {
                            if (!this.moodIndex[mood]) this.moodIndex[mood] = [];
                            this.moodIndex[mood].push({
                                bookIdx: bIdx,
                                chapter: c + 1,
                                verse: v + 1,
                                ...verseObj
                            });
                        }
                    }
                    chapters.push(verses);
                }

                return {
                    abbrev: mapping.abbrev,
                    chapters
                };
            });

            console.log('Bible data loaded into memory (BBE, KJV, HI) with Mood Indexes.');
        } catch (error) {
            console.error('Error loading Bible data:', error);
            process.exit(1);
        }
    }

    getBooks() {
        if (!bookMapping || bookMapping.length === 0) return [];
        return bookMapping;
    }

    getChapter(bookIdx, chapter, lang = 'en', version = 'bbe') {
        try {
            const book = this.bibleData[bookIdx];
            if (!book) return null;
            
            const chapterData = book.chapters[chapter - 1];
            if (!chapterData) return null;
            
            return {
                book: this.getBookName(bookIdx),
                chapter,
                verses: chapterData.map((verseObj, idx) => ({
                    verse: idx + 1,
                    text: lang === 'hi' ? verseObj.text_hi : (version === 'kjv' ? verseObj.text_kjv : verseObj.text_bbe),
                    mood: verseObj.mood || "none"
                }))
            };
        } catch (error) {
            return null;
        }
    }

    getChaptersCount(bookIdx) {
        try {
            const book = this.bibleData[bookIdx];
            if (!book) return 0;
            return book.chapters.length;
        } catch (error) {
            return 0;
        }
    }

    getVerse(bookIdx, chapter, verse, lang = 'en', version = 'bbe') {
        try {
            const book = this.bibleData[bookIdx];
            if (!book) return null;
            
            const chapterData = book.chapters[chapter - 1];
            if (!chapterData) return null;
            
            const verseObj = chapterData[verse - 1];
            if (!verseObj) return null;

            return {
                book: this.getBookName(bookIdx),
                chapter,
                verse,
                text: lang === 'hi' ? verseObj.text_hi : (version === 'kjv' ? verseObj.text_kjv : verseObj.text_bbe),
                mood: verseObj.mood || "none"
            };
        } catch (error) {
            return null;
        }
    }

    getRandomVerse(lang = 'en', version = 'bbe') {
        try {
            if (!this.bibleData || this.bibleData.length === 0) return null;
            
            const randomBookIdx = Math.floor(Math.random() * this.bibleData.length);
            const book = this.bibleData[randomBookIdx];
            if (!book || !book.chapters || book.chapters.length === 0) return null;

            const randomChapterIdx = Math.floor(Math.random() * book.chapters.length);
            const chapter = book.chapters[randomChapterIdx];
            if (!chapter || chapter.length === 0) return null;

            const randomVerseIdx = Math.floor(Math.random() * chapter.length);
            const verseObj = chapter[randomVerseIdx];
            if (!verseObj) return null;

            return {
                book: this.getBookName(randomBookIdx),
                chapter: randomChapterIdx + 1,
                verse: randomVerseIdx + 1,
                text: lang === 'hi' ? verseObj.text_hi : (version === 'kjv' ? verseObj.text_kjv : verseObj.text_bbe),
                mood: verseObj.mood || "none"
            };
        } catch (error) {
            console.error('Error in getRandomVerse:', error);
            return null;
        }
    }

    getAllVersesByMood(mood, lang = 'en', version = 'bbe') {
        try {
            const moodKey = mood ? mood.toLowerCase() : '';
            const versesSet = this.moodIndex[moodKey];
            
            if (!versesSet || versesSet.length === 0) return [];
            
            return versesSet.map(v => ({
                book: this.getBookName(v.bookIdx),
                chapter: v.chapter,
                verse: v.verse,
                text: lang === 'hi' ? v.text_hi : (version === 'kjv' ? v.text_kjv : v.text_bbe),
                mood: v.mood || "none"
            }));
        } catch (error) {
            console.error('Error in getAllVersesByMood:', error);
            return [];
        }
    }

    getVerseByMood(mood, lang = 'en', version = 'bbe') {
        try {
            const moodKey = mood ? mood.toLowerCase() : '';
            const verses = moodMapping[moodKey];
            if (!verses || verses.length === 0) return this.getRandomVerse(lang, version);

            const randomSelection = verses[Math.floor(Math.random() * verses.length)];
            return this.getVerse(randomSelection.bookIdx, randomSelection.chapter, randomSelection.verse, lang, version);
        } catch (error) {
            console.error('Error in getVerseByMood:', error);
            return this.getRandomVerse(lang, version);
        }
    }

    getBookName(index) {
        const book = bookMapping.find(b => b.index === index);
        return book ? book.name : "Unknown";
    }
}

module.exports = new BibleService();
