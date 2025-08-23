# PDF Translator

An interactive PDF translation tool that allows users to upload PDFs and tap on words to get instant translations.

## Features

- 📄 **PDF Upload**: Drag and drop or browse to upload PDF files
- 🔍 **Interactive Text Selection**: Click and select text directly on the PDF
- 🌐 **Instant Translation**: Get translations for selected words or phrases
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful, intuitive interface with smooth animations
- 🔧 **PDF Controls**: Zoom, rotate, and navigate through pages
- 📋 **Copy Translations**: Copy translated text to clipboard

## Tech Stack

- **Frontend**: React 18, Vite
- **PDF Processing**: react-pdf, pdfjs-dist
- **UI Components**: Lucide React icons
- **Styling**: CSS3 with modern design patterns
- **Backend**: Express.js (for translation API)
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

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

3. Start the development server:
```bash
# Start both frontend and backend
npm run dev:full

# Or start them separately:
npm run server  # Backend (port 3001)
npm run dev     # Frontend (port 5173)
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Upload a PDF**: Drag and drop a PDF file onto the upload area or click to browse
2. **Navigate**: Use the page controls to move between pages
3. **Select Text**: Click and drag to select text on the PDF
4. **Get Translation**: A popup will appear with the translation
5. **Copy Translation**: Click the copy button to copy the translation to clipboard
6. **Adjust View**: Use zoom and rotate controls to adjust the PDF view

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

## Project Structure

```
pdf-translator/
├── src/
│   ├── components/
│   │   ├── PDFUploader.jsx      # PDF upload component
│   │   ├── PDFViewer.jsx        # PDF viewer with controls
│   │   ├── TranslationPopup.jsx # Translation popup
│   │   └── TranslationProvider.jsx # Translation context provider
│   ├── contexts/
│   │   └── TranslationContext.jsx # Translation context
│   ├── hooks/
│   │   └── useTranslation.js    # Translation hook
│   ├── App.jsx                  # Main app component
│   ├── main.jsx                 # React entry point
│   ├── App.css                  # App styles
│   └── index.css                # Global styles
├── server.js                    # Express backend
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
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
