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
            const filePath = path.join(__dirname, '../data/bible_merged.json');
            let rawData = fs.readFileSync(filePath, 'utf8');
            if (rawData.charCodeAt(0) === 0xFEFF) {
                rawData = rawData.slice(1);
            }
            const flatData = JSON.parse(rawData);

            // Structure into efficient lookup array
            this.bibleData = [];
            bookMapping.forEach(mapping => {
                this.bibleData.push({
                    abbrev: mapping.abbrev,
                    chapters: []
                });
            });

            flatData.forEach(verse => {
                const bookInfo = bookMapping.find(b => b.name === verse.book);
                if (!bookInfo) return; // safeguard

                const bookIdx = bookInfo.index;
                const bData = this.bibleData[bookIdx];
                const chapIdx = verse.chapter - 1;
                
                while (bData.chapters.length <= chapIdx) {
                    bData.chapters.push([]);
                }
                
                bData.chapters[chapIdx].push({
                    text_en: verse.text_en,
                    text_hi: verse.text_hi || verse.text_en
                });
            });

            console.log('Merged Bible data loaded into memory.');
        } catch (error) {
            console.error('Error loading Bible data:', error);
            process.exit(1);
        }
    }

    getBooks() {
        return bookMapping;
    }

    getChapter(bookIdx, chapter, lang = 'en') {
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
                    text: lang === 'hi' ? verseObj.text_hi : verseObj.text_en
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

    getVerse(bookIdx, chapter, verse, lang = 'en') {
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
                text: lang === 'hi' ? verseObj.text_hi : verseObj.text_en
            };
        } catch (error) {
            return null;
        }
    }

    getRandomVerse(lang = 'en') {
        const randomBookIdx = Math.floor(Math.random() * this.bibleData.length);
        const book = this.bibleData[randomBookIdx];
        const randomChapterIdx = Math.floor(Math.random() * book.chapters.length);
        const chapter = book.chapters[randomChapterIdx];
        const randomVerseIdx = Math.floor(Math.random() * chapter.length);
        const verseObj = chapter[randomVerseIdx];

        return {
            book: this.getBookName(randomBookIdx),
            chapter: randomChapterIdx + 1,
            verse: randomVerseIdx + 1,
            text: lang === 'hi' ? verseObj.text_hi : verseObj.text_en
        };
    }

    getVerseByMood(mood, lang = 'en') {
        const verses = moodMapping[mood.toLowerCase()];
        if (!verses || verses.length === 0) return this.getRandomVerse(lang);

        const randomSelection = verses[Math.floor(Math.random() * verses.length)];
        return this.getVerse(randomSelection.bookIdx, randomSelection.chapter, randomSelection.verse, lang);
    }

    getBookName(index) {
        const book = bookMapping.find(b => b.index === index);
        return book ? book.name : "Unknown";
    }
}

module.exports = new BibleService();
