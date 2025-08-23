import React, { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [selectedText, setSelectedText] = useState('')
  const [viewMode, setViewMode] = useState('single') // 'single' or 'scroll'
  
  const containerRef = useRef(null)
  const pageRef = useRef(null)

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages)
    console.log(`PDF loaded successfully! Pages: ${numPages}`)
  }

  const handleTextSelection = (event) => {
    const selection = window.getSelection()
    const text = selection.toString().trim()
    
    if (text && text.length > 0) {
      // In scroll mode, try to detect which page the selection is from
      let detectedPage = pageNumber
      if (viewMode === 'scroll') {
        const range = selection.getRangeAt(0)
        const pageWrapper = range.commonAncestorContainer.parentElement?.closest('.pdf-page-wrapper')
        if (pageWrapper) {
          const pageElement = pageWrapper.querySelector('[data-page-number]')
          if (pageElement) {
            detectedPage = parseInt(pageElement.getAttribute('data-page-number'))
          }
        }
      }
      
      // Expand to full sentence if only one word is selected
      const expandedText = expandToSentenceContext(text, selection)
      
      setSelectedText(expandedText.displayText)
      setPageNumber(detectedPage) // Update current page for display
      
      console.log('=== TEXT SELECTION ===')
      console.log('Original selection:', text)
      console.log('Expanded to sentence:', expandedText.fullSentence)
      console.log('Selected word(s):', expandedText.selectedWords)
      console.log('Context details:', {
        originalText: text,
        fullSentence: expandedText.fullSentence,
        selectedWords: expandedText.selectedWords,
        wordCount: text.split(' ').length,
        sentenceLength: expandedText.fullSentence.length,
        page: detectedPage,
        viewMode: viewMode,
        isExpanded: expandedText.wasExpanded
      })
      console.log('====================')
    } else {
      setSelectedText('')
    }
  }

  // Function to expand selection to full sentence context
  const expandToSentenceContext = (selectedText, selection) => {
    try {
      const range = selection.getRangeAt(0)
      const containerElement = range.commonAncestorContainer.parentElement
      
      // Get the full text content of the container
      let fullText = ''
      if (containerElement) {
        // Try to get text from the text layer span or parent
        const textLayerSpan = containerElement.closest('.react-pdf__Page__textContent span') || 
                             containerElement.closest('.react-pdf__Page__textContent')
        
        if (textLayerSpan) {
          fullText = textLayerSpan.textContent || textLayerSpan.innerText || ''
        } else {
          fullText = containerElement.textContent || containerElement.innerText || ''
        }
      }
      
      if (!fullText) {
        return {
          displayText: selectedText,
          fullSentence: selectedText,
          selectedWords: selectedText,
          wasExpanded: false
        }
      }
      
      // Find the position of selected text in the full text
      const selectedIndex = fullText.indexOf(selectedText)
      if (selectedIndex === -1) {
        return {
          displayText: selectedText,
          fullSentence: selectedText,
          selectedWords: selectedText,
          wasExpanded: false
        }
      }
      
      // Define sentence boundaries (periods, exclamation marks, question marks)
      const sentenceEnders = /[.!?]+/g
      
      // Find sentence start (look backwards for sentence enders)
      let sentenceStart = 0
      const textBeforeSelection = fullText.substring(0, selectedIndex)
      const lastSentenceEnderMatch = textBeforeSelection.match(/[.!?]+/g)
      if (lastSentenceEnderMatch) {
        const lastEnderIndex = textBeforeSelection.lastIndexOf(lastSentenceEnderMatch[lastSentenceEnderMatch.length - 1])
        sentenceStart = lastEnderIndex + lastSentenceEnderMatch[lastSentenceEnderMatch.length - 1].length
      }
      
      // Find sentence end (look forwards for sentence enders)
      let sentenceEnd = fullText.length
      const textAfterSelection = fullText.substring(selectedIndex + selectedText.length)
      const nextSentenceEnderMatch = textAfterSelection.match(/[.!?]+/)
      if (nextSentenceEnderMatch) {
        const nextEnderIndex = textAfterSelection.indexOf(nextSentenceEnderMatch[0])
        sentenceEnd = selectedIndex + selectedText.length + nextEnderIndex + nextSentenceEnderMatch[0].length
      }
      
      // Extract the full sentence
      const fullSentence = fullText.substring(sentenceStart, sentenceEnd).trim()
      
      // Check if we actually expanded (more than just the selected text)
      const wasExpanded = fullSentence !== selectedText.trim()
      
      return {
        displayText: wasExpanded ? fullSentence : selectedText,
        fullSentence: fullSentence,
        selectedWords: selectedText,
        wasExpanded: wasExpanded
      }
      
    } catch (error) {
      console.error('Error expanding selection to sentence:', error)
      return {
        displayText: selectedText,
        fullSentence: selectedText,
        selectedWords: selectedText,
        wasExpanded: false
      }
    }
  }

  const handleMouseUp = (event) => {
    // Small delay to ensure selection is complete
    setTimeout(() => {
      handleTextSelection(event)
    }, 50)
  }

  // Simple text selection setup
  const onPageLoadSuccess = (page) => {
    console.log(`Page ${pageNumber} loaded successfully`)
    
    // Small delay to ensure text layer is rendered
    setTimeout(() => {
      const textLayerDiv = pageRef.current?.querySelector('.react-pdf__Page__textContent')
      
      if (textLayerDiv) {
        textLayerDiv.style.pointerEvents = 'auto'
        textLayerDiv.style.userSelect = 'text'
        console.log('Text layer enabled for selection')
      }
    }, 100)
  }

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0))
    console.log('Zoom in:', scale + 0.2)
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5))
    console.log('Zoom out:', scale - 0.2)
  }

  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
    console.log('Previous page:', pageNumber - 1)
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
    console.log('Next page:', pageNumber + 1)
  }

  const toggleViewMode = () => {
    const newMode = viewMode === 'single' ? 'scroll' : 'single'
    setViewMode(newMode)
    console.log('View mode changed to:', newMode)
  }

  // Render all pages for scroll mode
  const renderAllPages = () => {
    if (!numPages) return null
    
    const pages = []
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        <div key={i} className="pdf-page-wrapper">
          <div className="page-number-indicator">Page {i}</div>
          <Page
            pageNumber={i}
            scale={scale}
            onLoadSuccess={(page) => {
              console.log(`Page ${i} loaded in scroll mode`)
              // Enable text selection for this page
              setTimeout(() => {
                const textLayerDiv = document.querySelector(`[data-page-number="${i}"] .react-pdf__Page__textContent`)
                if (textLayerDiv) {
                  textLayerDiv.style.pointerEvents = 'auto'
                  textLayerDiv.style.userSelect = 'text'
                }
              }, 100)
            }}
            onMouseUp={handleMouseUp}
            className="pdf-page"
            renderTextLayer={true}
            renderAnnotationLayer={false}
            data-page-number={i}
          />
        </div>
      )
    }
    return pages
  }

  return (
    <div className="pdf-viewer" ref={containerRef}>
      <div className="pdf-controls">
        {/* View Mode Toggle */}
        <div className="view-mode-controls">
          <button 
            onClick={toggleViewMode}
            className={`view-mode-button ${viewMode === 'single' ? 'active' : ''}`}
          >
            📄 Single Page
          </button>
          <button 
            onClick={toggleViewMode}
            className={`view-mode-button ${viewMode === 'scroll' ? 'active' : ''}`}
          >
            📜 Scroll View
          </button>
        </div>

        {/* Page Navigation (only for single page mode) */}
        {viewMode === 'single' && (
          <div className="page-controls">
            <button 
              onClick={goToPreviousPage} 
              disabled={pageNumber <= 1}
              className="control-button"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="page-info">
              Page {pageNumber} of {numPages}
            </span>
            <button 
              onClick={goToNextPage} 
              disabled={pageNumber >= numPages}
              className="control-button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Zoom Controls */}
        <div className="zoom-controls">
          <button onClick={handleZoomOut} className="control-button">
            <ZoomOut size={20} />
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={handleZoomIn} className="control-button">
            <ZoomIn size={20} />
          </button>
        </div>
      </div>

      {/* Selected Text Display */}
      {selectedText && (
        <div className="selected-text-display">
          <div className="selected-text-header">
            <h4>📖 Context Selection:</h4>
            <button 
              onClick={() => {
                setSelectedText('')
                window.getSelection().removeAllRanges()
                console.log('Selection cleared')
              }}
              className="clear-selection-button"
            >
              Clear
            </button>
          </div>
          <div className="context-display">
            <p className="context-text">"{selectedText}"</p>
            <div className="selection-info">
              <span className="info-badge">Page {pageNumber}</span>
              <span className="info-badge">{selectedText.split(' ').length} words</span>
              <span className="info-badge">{selectedText.length} chars</span>
              <span className="info-badge context-badge">📝 Full Context</span>
            </div>
          </div>
        </div>
      )}

      <div className={`pdf-container ${viewMode === 'scroll' ? 'scroll-mode' : 'single-mode'}`}>
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(error) => {
            console.error('Error loading PDF:', error)
          }}
        >
          {viewMode === 'single' ? (
            // Single page mode
            <div ref={pageRef}>
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onLoadSuccess={onPageLoadSuccess}
                onMouseUp={handleMouseUp}
                className="pdf-page"
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            </div>
          ) : (
            // Scroll mode - render all pages
            <div className="scroll-pages-container">
              {renderAllPages()}
            </div>
          )}
        </Document>
      </div>
    </div>
  )
}

export default PDFViewer
