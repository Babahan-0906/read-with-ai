import React, { useCallback, useState } from 'react'
import { Upload, FileText } from 'lucide-react'

const PDFUploader = ({ onFileUpload }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      handleFileSelect(pdfFile)
    }
  }, [])

  const handleFileSelect = async (file) => {
    console.log('File selected:', file)
    
    if (file.type !== 'application/pdf') {
      console.error('Invalid file type:', file.type)
      alert('Please select a PDF file')
      return
    }

    setIsLoading(true)
    console.log('Loading PDF file...')
    
    try {
      onFileUpload(file)
      console.log('PDF file uploaded successfully')
    } catch (error) {
      console.error('Error processing PDF:', error)
      alert('Error processing PDF file')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  return (
    <div className="pdf-uploader">
      <div
        className={`upload-area ${isDragOver ? 'drag-over' : ''} ${isLoading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <div className="upload-icon">
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <Upload size={48} />
            )}
          </div>
          <h3>Upload your PDF</h3>
          <p>Drag and drop your PDF file here, or click to browse</p>
          <div className="file-info">
            <FileText size={16} />
            <span>Supports PDF files only</span>
          </div>
        </div>
        
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className="file-input"
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

export default PDFUploader
