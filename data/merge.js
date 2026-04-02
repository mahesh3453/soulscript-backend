const fs = require('fs');
const path = require('path');

const bibleBooks = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", 
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", 
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", 
  "Nehemiah", "Esther", "Job", "Psalms", "Proverbs", 
  "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations", 
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", 
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", 
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", 
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", 
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians", "1 Timothy", 
  "2 Timothy", "Titus", "Philemon", "Hebrews", "James", 
  "1 Peter", "2 Peter", "1 John", "2 John", "3 John", 
  "Jude", "Revelation"
];

function readJSON(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  return JSON.parse(content);
}

try {
  const enData = readJSON(path.join(__dirname, 'en_kjv.json'));
  const hiData = readJSON(path.join(__dirname, 'hi.json'));

  const merged = [];

  // Assuming hiData.Book length matches bibleBooks length
  for (let b = 0; b < bibleBooks.length; b++) {
    const bookName = bibleBooks[b];
    
    // Safety check - make sure english and hindi arrays exist for this book
    if (!enData[b] || !hiData.Book[b]) continue;
    
    const enChapters = enData[b].chapters;
    const hiChapters = hiData.Book[b].Chapter;

    for (let c = 0; c < enChapters.length; c++) {
      const chapterNum = c + 1;
      
      const enVerses = enChapters[c];
      const hiVerses = hiChapters[c] ? hiChapters[c].Verse : [];
      
      for (let v = 0; v < enVerses.length; v++) {
        const verseNum = v + 1;
        const textEn = enVerses[v];
        
        let textHi = "";
        if (hiVerses[v] && hiVerses[v].Verse) {
          textHi = hiVerses[v].Verse;
        } else {
          // graceful fallback
          textHi = textEn;
        }

        merged.push({
          book: bookName,
          chapter: chapterNum,
          verse: verseNum,
          text_en: textEn,
          text_hi: textHi
        });
      }
    }
  }

  const outPath = path.join(__dirname, 'bible_merged.json');
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2), 'utf8');
  console.log("Successfully generated bible_merged.json with " + merged.length + " verses.");
} catch (error) {
  console.error("Error during merge process:", error);
}
