# PDF Text Selection & Context Expansion Documentation

## 📖 Overview

The PDF Text Selector now includes intelligent context expansion that automatically selects the full sentence context when you select a word or phrase. This provides better context for understanding and future translation features.

## 🔍 How Context Selection Works

### 1. Basic Selection
When you select text in the PDF:
- **Single word**: Expands to the full sentence
- **Multiple words**: Expands to sentence boundaries
- **Full sentence**: No expansion needed

### 2. Sentence Boundary Detection

The system uses **sentence delimiters** to identify sentence boundaries:

```javascript
// Current sentence boundaries (configurable)
const sentenceDelimiters = /[.!?]+/g

// Examples of sentence endings:
"This is a sentence."    // Period
"This is exciting!"      // Exclamation mark
"Is this working?"       // Question mark
```

### 3. Context Expansion Algorithm

```javascript
1. Detect selected text position in the full text layer
2. Look backwards for the previous sentence delimiter
3. Look forwards for the next sentence delimiter
4. Extract the complete sentence between delimiters
5. Return both original selection and full context
```

### 4. Visual Feedback

#### Console Output:
```javascript
=== TEXT SELECTION ===
Original selection: "world"
Expanded to sentence: "Hello world! How are you today?"
Selected word(s): "world"
Context details: {
  originalText: "world",
  fullSentence: "Hello world! How are you today?",
  selectedWords: "world",
  wordCount: 1,
  sentenceLength: 32,
  page: 1,
  viewMode: "single",
  isExpanded: true
}
====================
```

#### Visual Display:
- Shows the complete sentence context
- Highlights that this is "Full Context"
- Displays metadata (page, word count, character count)

## 🎯 Current Implementation

### Text Layer Access
```javascript
// The system accesses the PDF.js text layer:
// 1. react-pdf creates text layer with spans
// 2. Each span contains text with positioning
// 3. We extract full text content from parent container
// 4. Find selected text position within full text
```

### Boundary Examples

#### Example 1: Single Word Selection
```text
Original PDF: "The quick brown fox jumps over the lazy dog. This is another sentence!"

User selects: "fox"

Result: "The quick brown fox jumps over the lazy dog."
```

#### Example 2: Multi-word Selection
```text
Original PDF: "Hello world! How are you today? I am fine."

User selects: "world! How are"

Result: "Hello world! How are you today?"
```

#### Example 3: Already Complete Sentence
```text
Original PDF: "This is a complete sentence. Another sentence here."

User selects: "This is a complete sentence."

Result: "This is a complete sentence." (no expansion)
```

## 🔧 Configuration Options

### Sentence Delimiters
Currently configured for common sentence endings:
- **Periods** (`.`)
- **Exclamation marks** (`!`)
- **Question marks** (`?`)

### Future Enhancements
- **Language-specific delimiters** (e.g., Japanese `。`, Chinese `。`)
- **Custom delimiters** (e.g., `;` for clauses)
- **Paragraph boundaries** for longer contexts
- **Machine learning** for better sentence detection

## 📱 Responsive Behavior

### Desktop (>768px)
- Full visual display with all information
- Complete console logging
- Rich context information

### Mobile (<768px)
- Condensed visual display
- Essential information only
- Touch-friendly interface

## 🔍 Debugging & Testing

### Console Commands
Open browser DevTools and try:

```javascript
// Test with different sentence structures
// 1. Select a single word
// 2. Select multiple words
// 3. Select across sentence boundaries
// 4. Test with different punctuation
```

### Edge Cases
- **No delimiters found**: Returns original selection
- **Text layer not available**: Falls back to basic selection
- **Multiple sentences selected**: Expands to outermost boundaries
- **Special characters**: Handles Unicode and special punctuation

## 🚀 Future Improvements

### Enhanced Context Detection
```javascript
// Potential improvements:
1. // Natural language processing for better sentence detection
2. // Context-aware expansion (paragraph vs sentence)
3. // User preference settings for context length
4. // Multi-language support for sentence boundaries
```

### Performance Optimizations
```javascript
// Future optimizations:
1. // Cached text layer analysis
2. // Incremental boundary detection
3. // Memory-efficient text processing
4. // Lazy loading of text content
```

## 📊 Usage Statistics

### Context Expansion Metrics
- **Expansion Rate**: Percentage of selections that get expanded
- **Average Expansion**: Words added to original selection
- **Success Rate**: Percentage of successful context extractions
- **Error Rate**: Failed expansions due to text layer issues

## 🛠 Technical Details

### Dependencies
- **react-pdf**: PDF rendering and text layer creation
- **pdfjs-dist**: Core PDF processing engine
- **Browser Selection API**: Native text selection handling

### Architecture
1. **PDF Loading**: react-pdf creates text layer
2. **Selection Detection**: Browser Selection API captures user selection
3. **Text Extraction**: DOM traversal to get full text content
4. **Boundary Analysis**: Regex-based sentence delimiter detection
5. **Context Expansion**: Text manipulation to extract full sentence
6. **Display Update**: Visual feedback with expanded context

## 📝 Implementation Notes

### Current Limitations
- **Sentence boundaries**: Only uses basic punctuation
- **Text layer access**: Depends on PDF.js text layer generation
- **Multi-column layouts**: May not handle complex layouts perfectly
- **Scanned PDFs**: Won't work with image-based PDFs

### Best Practices
1. **Test with different PDF types**: Text-based vs image-based
2. **Check various layouts**: Single column, multi-column, tables
3. **Test edge cases**: Very long sentences, no punctuation, special characters
4. **Monitor performance**: Large PDFs may need optimization

## 🎉 Summary

The context selection feature provides intelligent text expansion that:
- **Automatically detects sentence boundaries** using punctuation
- **Provides full context** for better understanding
- **Works seamlessly** with existing PDF text selection
- **Offers visual feedback** through enhanced UI
- **Includes comprehensive logging** for debugging

This creates a much more useful experience for users who need to understand text in context, especially useful for translation, reading comprehension, or document analysis tasks.
