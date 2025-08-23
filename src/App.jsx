import React, { useState } from 'react'
import PDFUploader from './components/PDFUploader'
import PDFViewer from './components/PDFViewer'
import './App.css'

function App() {
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfUrl, setPdfUrl] = useState(null)

  const handleFileUpload = (file) => {
    setPdfFile(file)
    const url = URL.createObjectURL(file)
    setPdfUrl(url)
    console.log('PDF uploaded:', file.name, 'Size:', file.size, 'bytes')
  }

  const handleReset = () => {
    setPdfFile(null)
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl)
      setPdfUrl(null)
    }
    console.log('PDF reset')
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDF Text Selector</h1>
        <p>Upload a PDF and select text to see it in the console</p>
      </header>
      
      <main className="app-main">
        {!pdfFile ? (
          <PDFUploader onFileUpload={handleFileUpload} />
        ) : (
          <div className="pdf-container">
            <div className="pdf-controls">
              <button onClick={handleReset} className="reset-button">
                Upload New PDF
              </button>
            </div>
            <PDFViewer pdfUrl={pdfUrl} />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
