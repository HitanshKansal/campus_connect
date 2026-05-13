// backend/utils/extractIdCard.js

const Tesseract = require('tesseract.js');

const extractIdCardInfo = async (imageUrl) => {
  try {
    console.log('🔍 Starting OCR...');

    const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    console.log('📄 Raw OCR Text:\n', text);

    const extractedInfo = parseIdCardText(text);
    console.log('✅ Parsed Info:', extractedInfo);
    
    return extractedInfo;

  } catch (error) {
    console.error('OCR Error:', error.message);
    return { name: '', college: '', department: '', rollNo: '', rawText: '' };
  }
};

const parseIdCardText = (text) => {
  // Clean up text
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 2);

  console.log('📝 Lines found:', lines);

  let name = '';
  let college = '';
  let department = '';
  let rollNo = '';

  // Known college keywords to detect college name
  const collegeKeywords = [
    'institute', 'university', 'college', 'technology',
    'management', 'bajaj', 'engineering', 'science',
    'polytechnic', 'school', 'academy'
  ];

  // Known department keywords
  const departmentKeywords = [
    'mca', 'bca', 'btech', 'b.tech', 'mtech', 'm.tech',
    'mba', 'bba', 'bsc', 'b.sc', 'msc', 'm.sc',
    'computer science', 'information technology',
    'electronics', 'mechanical', 'civil', 'electrical',
    'commerce', 'arts', 'science'
  ];

  // Roll number pattern (alphanumeric, 6-12 chars)
  const rollNoPattern = /^[A-Z0-9]{6,15}$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();

    // Detect college name
    if (collegeKeywords.some(k => lineLower.includes(k)) && !college) {
      // Skip lines that are addresses
      if (!lineLower.includes('plot') && !lineLower.includes('noida') &&
          !lineLower.includes('delhi') && !lineLower.includes('phone')) {
        college = line;
      }
    }

    // Detect department (short course codes)
    if (departmentKeywords.some(k => lineLower === k || lineLower.includes(k))) {
      if (line.length < 50) { // avoid long address lines
        department = line.toUpperCase();
      }
    }

    // Detect roll number (alphanumeric pattern like 24150CN198)
    if (rollNoPattern.test(line) && !rollNo) {
      rollNo = line;
    }

    // Detect name:
    // Name is usually ALL CAPS, only letters and spaces, 5-40 chars
    // and comes before roll number
    const namePattern = /^[A-Z][A-Z\s]{4,39}$/;
    if (namePattern.test(line) && !name) {
      // Skip if it's a college/department line
      const isCollegeLine = collegeKeywords.some(k => lineLower.includes(k));
      const isDeptLine = departmentKeywords.some(k => lineLower.includes(k));
      const isShortWord = line.split(' ').length === 1 && line.length < 4;
      
      if (!isCollegeLine && !isDeptLine && !isShortWord) {
        name = line;
      }
    }
  }

  // Special case: if college contains "GL BAJAJ" or similar
  // Try to find full college name by combining lines
  if (!college) {
    for (let i = 0; i < lines.length; i++) {
      const lineLower = lines[i].toLowerCase();
      if (lineLower.includes('gl bajaj') || lineLower.includes('bajaj')) {
        college = 'GL Bajaj Institute of Technology & Management';
        break;
      }
    }
  }

  return {
    name: name || '',
    college: college || '',
    department: department || '',
    rollNo: rollNo || '',
    rawText: text,
    // Flag if extraction was incomplete
    isComplete: !!(name && college && department),
  };
};

module.exports = { extractIdCardInfo };