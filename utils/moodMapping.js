/**
 * Mood mapping configuration.
 * Maps moods to specific Bible verses (Book, Chapter, Verse).
 */
const moodMapping = {
    happy: [
        { bookIdx: 18, chapter: 118, verse: 24 }, // Psalms 118:24
        { bookIdx: 18, chapter: 16, verse: 11 },  // Psalms 16:11
        { bookIdx: 19, chapter: 17, verse: 22 },  // Proverbs 17:22
        { bookIdx: 49, chapter: 4, verse: 4 }     // Philippians 4:4
    ],
    sad: [
        { bookIdx: 18, chapter: 34, verse: 18 },  // Psalms 34:18
        { bookIdx: 39, chapter: 5, verse: 4 },    // Matthew 5:4
        { bookIdx: 65, chapter: 21, verse: 4 },   // Revelation 21:4
        { bookIdx: 18, chapter: 147, verse: 3 }   // Psalms 147:3
    ],
    anxiety: [
        { bookIdx: 49, chapter: 4, verse: 6 },    // Philippians 4:6
        { bookIdx: 59, chapter: 5, verse: 7 },    // 1 Peter 5:7
        { bookIdx: 39, chapter: 6, verse: 34 },   // Matthew 6:34
        { bookIdx: 18, chapter: 94, verse: 19 }   // Psalms 94:19
    ],
    peace: [
        { bookIdx: 42, chapter: 14, verse: 27 },  // John 14:27
        { bookIdx: 22, chapter: 26, verse: 3 },   // Isaiah 26:3
        { bookIdx: 44, chapter: 15, verse: 13 },  // Romans 15:13
        { bookIdx: 18, chapter: 29, verse: 11 }   // Psalms 29:11
    ],
    motivation: [
        { bookIdx: 5, chapter: 1, verse: 9 },     // Joshua 1:9
        { bookIdx: 49, chapter: 4, verse: 13 },   // Philippians 4:13
        { bookIdx: 22, chapter: 40, verse: 31 },  // Isaiah 40:31
        { bookIdx: 45, chapter: 15, verse: 58 }   // 1 Corinthians 15:58
    ],
    fear: [
        { bookIdx: 22, chapter: 41, verse: 10 },  // Isaiah 41:10
        { bookIdx: 18, chapter: 27, verse: 1 },   // Psalms 27:1
        { bookIdx: 54, chapter: 1, verse: 7 },    // 2 Timothy 1:7
        { bookIdx: 39, chapter: 10, verse: 28 }   // Matthew 10:28
    ],
    hope: [
        { bookIdx: 23, chapter: 29, verse: 11 },  // Jeremiah 29:11
        { bookIdx: 44, chapter: 15, verse: 4 },   // Romans 15:4
        { bookIdx: 18, chapter: 31, verse: 24 },  // Psalms 31:24
        { bookIdx: 22, chapter: 40, verse: 31 }   // Isaiah 40:31
    ],
    gratitude: [
        { bookIdx: 18, chapter: 136, verse: 1 },  // Psalms 136:1
        { bookIdx: 49, chapter: 4, verse: 6 },    // Philippians 4:6
        { bookIdx: 51, chapter: 3, verse: 16 },   // Colossians 3:16
        { bookIdx: 51, chapter: 3, verse: 17 }    // Colossians 3:17
    ],
    loneliness: [
        { bookIdx: 39, chapter: 28, verse: 20 },  // Matthew 28:20
        { bookIdx: 18, chapter: 139, verse: 7 },  // Psalms 139:7
        { bookIdx: 22, chapter: 41, verse: 10 },  // Isaiah 41:10
        { bookIdx: 42, chapter: 14, verse: 18 }   // John 14:18
    ],
    strength: [
        { bookIdx: 49, chapter: 4, verse: 13 },   // Philippians 4:13
        { bookIdx: 18, chapter: 46, verse: 1 },   // Psalms 46:1
        { bookIdx: 22, chapter: 40, verse: 29 },  // Isaiah 40:29
        { bookIdx: 47, chapter: 12, verse: 9 }    // 2 Corinthians 12:9
    ],
    faith: [
        { bookIdx: 57, chapter: 11, verse: 1 },   // Hebrews 11:1
        { bookIdx: 39, chapter: 17, verse: 20 },  // Matthew 17:20
        { bookIdx: 44, chapter: 10, verse: 17 },  // Romans 10:17
        { bookIdx: 46, chapter: 16, verse: 13 }   // Mark 16:13 (via Galatians 5:5→ use Galatians 5:5)
    ],
    healing: [
        { bookIdx: 23, chapter: 30, verse: 17 },  // Jeremiah 30:17
        { bookIdx: 18, chapter: 103, verse: 3 },  // Psalms 103:3
        { bookIdx: 22, chapter: 53, verse: 5 },   // Isaiah 53:5
        { bookIdx: 23, chapter: 33, verse: 6 }    // Jeremiah 33:6
    ]
};

module.exports = moodMapping;
