const bibleService = require('../services/bibleService');
const bookMapping = require('../utils/bookMapping');

exports.getRandomVerse = (req, res) => {
    try {
        const lang = req.query.lang || 'en';
        const verse = bibleService.getRandomVerse(lang);
        if (!verse) {
            return res.status(404).json({ error: 'No verses found' });
        }
        res.json(verse);
    } catch (error) {
        console.error('getRandomVerse error:', error);
        res.status(500).json({ error: 'Failed to fetch random verse' });
    }
};

exports.getVerseByMood = (req, res) => {
    try {
        const mood = req.params.mood;
        const lang = req.query.lang || 'en';
        const verse = bibleService.getVerseByMood(mood, lang);
        if (!verse) {
            return res.status(404).json({ error: 'Mood not found' });
        }
        res.json(verse);
    } catch (error) {
        console.error('getVerseByMood error:', error);
        res.status(500).json({ error: 'Failed to fetch mood-based verse' });
    }
};

exports.getBooks = (req, res) => {
    try {
        const books = bibleService.getBooks();
        if (!books || books.length === 0) {
            return res.status(404).json({ error: 'No books found' });
        }
        res.json(books);
    } catch (error) {
        console.error('getBooks error:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
};

exports.getChaptersCount = (req, res) => {
    try {
        const { book } = req.params;
        let bookIdx = -1;
        
        if (!isNaN(book)) {
            bookIdx = parseInt(book);
        } else {
            const found = bookMapping.find(b => 
                b.name.toLowerCase() === book.toLowerCase() || 
                b.abbrev.toLowerCase() === book.toLowerCase()
            );
            if (found) bookIdx = found.index;
        }

        if (bookIdx === -1) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const count = bibleService.getChaptersCount(bookIdx);
        res.json({ count });
    } catch (error) {
        console.error('getChaptersCount error:', error);
        res.status(500).json({ error: 'Failed to fetch chapters count' });
    }
};

exports.getChapter = (req, res) => {
    try {
        const { book, chapter } = req.params;
        let bookIdx = -1;
        
        if (!isNaN(book)) {
            bookIdx = parseInt(book);
        } else {
            const found = bookMapping.find(b => 
                b.name.toLowerCase() === book.toLowerCase() || 
                b.abbrev.toLowerCase() === book.toLowerCase()
            );
            if (found) bookIdx = found.index;
        }

        if (bookIdx === -1) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const lang = req.query.lang || 'en';
        const result = bibleService.getChapter(bookIdx, parseInt(chapter), lang);
        if (!result) {
            return res.status(404).json({ error: 'Chapter not found' });
        }
        res.json(result);
    } catch (error) {
        console.error('getChapter error:', error);
        res.status(500).json({ error: 'Failed to fetch chapter' });
    }
};

exports.getSpecificVerse = (req, res) => {
    try {
        const { book, chapter, verse } = req.params;
        let bookIdx = -1;
        
        if (!isNaN(book)) {
            bookIdx = parseInt(book);
        } else {
            const found = bookMapping.find(b => 
                b.name.toLowerCase() === book.toLowerCase() || 
                b.abbrev.toLowerCase() === book.toLowerCase()
            );
            if (found) bookIdx = found.index;
        }

        if (bookIdx === -1) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        const lang = req.query.lang || 'en';
        const result = bibleService.getVerse(bookIdx, parseInt(chapter), parseInt(verse), lang);
        if (!result) {
            return res.status(404).json({ error: 'Verse not found' });
        }
        res.json(result);
    } catch (error) {
        console.error('getSpecificVerse error:', error);
        res.status(500).json({ error: 'Failed to fetch specific verse' });
    }
};
