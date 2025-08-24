# PDF Translator

An interactive PDF translation tool that allows users to upload PDFs and tap on words to get instant translations.

## Features

- 📄 **PDF Upload**: Drag and drop or browse to upload PDF files
- 🔍 **Interactive Text Selection**: Click and select text directly on the PDF
- 📝 **Smart Context Expansion**: Automatically expands selections to include surrounding lines for better context
- 🤖 **AI Word Explanations**: Get bilingual explanations (English + Turkish/Russian/Turkmen) powered by Google Gemini AI
- 🔄 **Dual View Modes**: Single page view and scrollable document view
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
- 🔧 **PDF Controls**: Zoom, rotate, and navigate through pages
- 📋 **Console Logging**: Detailed logging of all text selections and expansions
- 📊 **Visual Feedback**: Real-time display of selected text with context information

## Tech Stack

- **Frontend**: React 18, Vite
- **PDF Processing**: react-pdf, pdfjs-dist
- **UI Components**: Lucide React icons
- **Styling**: CSS3 with modern design patterns
- **Backend**: Express.js with Gemini AI integration
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Google Gemini AI API Key (get from [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pdf-translator
```

2. Install dependencies:
```bash
npm install
```

3. Set up your Gemini AI API key:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API key
# GOOGLE_AI_API_KEY=your_actual_api_key_here
```

4. Start the development server:
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
npm run server  # Backend (port 3001)
npm run dev     # Frontend (port 5173)
```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Upload a PDF**: Drag and drop a PDF file onto the upload area or click to browse
2. **Choose View Mode**: Toggle between Single Page and Scroll View
3. **Navigate**: Use page controls (in single mode) or scroll naturally (in scroll mode)
4. **Select Text**: Click and drag to select text on the PDF
   - **Any selection**: Automatically expands to include the line above and below for better context
   - **Multi-line context**: Provides comprehensive surrounding text for understanding
5. **Choose Secondary Language**: Select your preferred secondary language (Turkish, Russian, Turkmen)
6. **Get Word Explanations**: For single words or short selections, AI explanations appear automatically
   - **Bilingual Explanations**: Dictionary and contextual meanings in both English and your selected language
   - **Dictionary View**: Traditional dictionary definitions in both languages
   - **Context View**: How the word is used in the specific context in both languages
7. **Toggle Explanation Views**: Use the buttons to switch between dictionary and contextual explanations
8. **Clear Selection**: Click the "Clear" button to reset the selection and explanations
9. **Adjust View**: Use zoom controls to adjust the PDF view

### Context Selection Examples

```javascript
// Console output shows:
=== TEXT SELECTION ===
Original selection: "world"
Expanded to context: "Hello world! How are you today? This is a great example."
Selected word(s): "world"
Context details: {
  originalText: "world",
  fullContext: "Hello world! How are you today? This is a great example.",
  contextLines: 2,
  lineRange: "1-3",
  isExpanded: true
}

// API Response includes both languages:
{
  word: "world",
  dictionaryEnglish: "noun: the earth and all people and things on it",
  dictionarySecondary: "isim: dünya ve üzerindeki tüm insanlar ve şeyler",
  contextualEnglish: "Here 'world' refers to the planet Earth",
  contextualSecondary: "Burada 'world' gezegen Dünya anlamına gelir",
  secondaryLanguage: "turkish"
}
====================
```

## API Integration

The application currently uses a mock translation service. To integrate with a real translation API:

1. **Google Translate API**:
   ```javascript
   // Replace the mockTranslate function in server.js
   const { Translate } = require('@google-cloud/translate').v2;
   const translate = new Translate({ projectId: 'your-project-id' });
   
   const result = await translate.translate(text, targetLanguage);
   return result[0];
   ```

2. **DeepL API**:
   ```javascript
   const axios = require('axios');
   
   const response = await axios.post('https://api-free.deepl.com/v2/translate', {
     text: [text],
     target_lang: targetLanguage
   }, {
     headers: { 'Authorization': 'DeepL-Auth-Key your-api-key' }
   });
   
   return response.data.translations[0].text;
   ```

3. **Microsoft Translator**:
   ```javascript
   const axios = require('axios');
   
   const response = await axios.post('https://api.cognitive.microsofttranslator.com/translate', {
     text: [text]
   }, {
     params: { 'api-version': '3.0', 'to': targetLanguage },
     headers: { 'Ocp-Apim-Subscription-Key': 'your-api-key' }
   });
   
   return response.data[0].translations[0].text;
   ```

## Documentation

- **[TEXT_SELECTION_DOCS.md](TEXT_SELECTION_DOCS.md)** - Comprehensive documentation on text selection and context expansion
- **[git-workflow.md](git-workflow.md)** - Git workflow and development guidelines

## Project Structure

```
pdf-translator/
├── src/
│   ├── components/
│   │   ├── PDFUploader.jsx      # PDF upload component
│   │   ├── PDFViewer.jsx        # PDF viewer with context selection
│   │   ├── TranslationPopup.jsx # Translation popup (future)
│   │   └── TranslationProvider.jsx # Translation context provider (future)
│   ├── contexts/
│   │   └── TranslationContext.jsx # Translation context (future)
│   ├── hooks/
│   │   └── useTranslation.js    # Translation hook (future)
│   ├── utils/
│   │   └── pdfTextExtractor.js  # PDF text extraction utilities
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   ├── App.css                  # App styles
│   └── index.css                # Global styles
├── server.js                    # Express backend (for future translation API)
├── package.json                 # Dependencies and scripts
├── README.md                    # This file
├── TEXT_SELECTION_DOCS.md       # Text selection documentation
└── git-workflow.md              # Git workflow guidelines
```

## Customization

### Styling
- Modify `src/App.css` for component-specific styles
- Modify `src/index.css` for global styles
- The app uses CSS custom properties for easy theming

### Translation Service
- Update the `translate` function in `server.js`
- Add your API keys to environment variables
- Implement error handling for API failures

### PDF Processing
- The app uses `react-pdf` for PDF rendering
- Text selection is handled by the PDF.js text layer
- Customize PDF controls in `PDFViewer.jsx`

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Mobile Support

The application is fully responsive and works on mobile devices:
- Touch-friendly interface
- Responsive PDF viewer
- Mobile-optimized controls

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## Roadmap

- [ ] Add support for more file formats
- [ ] Implement offline translation
- [ ] Add translation history
- [ ] Support for multiple languages
- [ ] PDF annotation features
- [ ] Export translated PDFs
