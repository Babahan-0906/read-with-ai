import React, { useState, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, BookOpen, MessageCircle, Languages } from 'lucide-react'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFViewer = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [selectedText, setSelectedText] = useState('')
  const [viewMode, setViewMode] = useState('single') // 'single' or 'scroll'
  const [wordExplanation, setWordExplanation] = useState(null)
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false)
  const [showContextual, setShowContextual] = useState(false)
  
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
      console.log('Expanded to context:', expandedText.fullContext)
      console.log('Selected word(s):', expandedText.selectedWords)
      console.log('Context details:', {
        originalText: text,
        fullContext: expandedText.fullContext,
        selectedWords: expandedText.selectedWords,
        wordCount: text.split(' ').length,
        contextLength: expandedText.fullContext.length,
        contextSpans: expandedText.contextSpans,
        spanRange: expandedText.spanRange,
        page: detectedPage,
        viewMode: viewMode,
        isExpanded: expandedText.wasExpanded
      })
      console.log('====================')

      // Automatically get explanation for the first word or short selection
      const words = text.trim().split(' ')
      if (words.length === 1 || (words.length <= 3 && text.length < 20)) {
        const firstWord = words[0].replace(/[^\w]/g, '')
        if (firstWord.length > 2) { // Only explain meaningful words
          console.log('Auto-explaining word:', firstWord)
          getWordExplanation(firstWord, expandedText.fullContext)
        }
      }
    } else {
      setSelectedText('')
    }
  }

  // Function to expand selection to include surrounding lines
  const expandToSentenceContext = (selectedText, selection) => {
    try {
      const range = selection.getRangeAt(0)
      const startContainer = range.startContainer
      const endContainer = range.endContainer

      // Find the text layer and get all text spans
      const textLayerDiv = startContainer.parentElement?.closest('.react-pdf__Page__textContent') ||
                          startContainer.parentElement?.closest('.textLayer')

      if (!textLayerDiv) {
        return {
          displayText: selectedText,
          fullContext: selectedText,
          selectedWords: selectedText,
          wasExpanded: false
        }
      }

      // Get all text spans from the text layer
      const textSpans = Array.from(textLayerDiv.querySelectorAll('span')).filter(span =>
        span.textContent && span.textContent.trim().length > 0
      )

      // Find the spans that contain the selection
      const selectedSpans = []
      let currentText = ''
      let selectionStartIndex = -1
      let selectionEndIndex = -1

      console.log('Debug: Looking for selection in', textSpans.length, 'spans')
      console.log('Debug: Start container:', startContainer)
      console.log('Debug: End container:', endContainer)

      for (let i = 0; i < textSpans.length; i++) {
        const span = textSpans[i]
        const spanText = span.textContent || ''

        // Check if this span contains part of the selection
        if (startContainer.nodeType === Node.TEXT_NODE &&
            span.contains(startContainer.parentElement)) {
          selectionStartIndex = i
          console.log('Debug: Found start span at index', i, 'with text:', spanText)
        }

        if (endContainer.nodeType === Node.TEXT_NODE &&
            span.contains(endContainer.parentElement)) {
          selectionEndIndex = i
          console.log('Debug: Found end span at index', i, 'with text:', spanText)
        }

        currentText += spanText + ' '
      }

      console.log('Debug: Selection spans - Start:', selectionStartIndex, 'End:', selectionEndIndex)

      // If we couldn't find the exact spans, fall back to simple context
      if (selectionStartIndex === -1 && selectionEndIndex === -1) {
        return {
          displayText: selectedText,
          fullContext: selectedText,
          selectedWords: selectedText,
          wasExpanded: false
        }
      }

      // Get the range of spans to include (2 spans before to 2 spans after)
      const startSpan = Math.max(0, Math.min(selectionStartIndex, selectionEndIndex) - 2)
      const endSpan = Math.min(textSpans.length, Math.max(selectionStartIndex, selectionEndIndex) + 3)

      // Extract text from the surrounding spans
      const contextSpans = textSpans.slice(startSpan, endSpan)
      const fullContext = contextSpans.map(span => span.textContent || '').join(' ').trim()

      // Check if we actually expanded
      const wasExpanded = fullContext !== selectedText.trim() && contextSpans.length > 1

      return {
        displayText: wasExpanded ? fullContext : selectedText,
        fullContext: fullContext,
        selectedWords: selectedText,
        wasExpanded: wasExpanded,
        contextSpans: contextSpans.length,
        spanRange: `${startSpan + 1}-${endSpan}`
      }

    } catch (error) {
      console.error('Error expanding selection to context:', error)
      return {
        displayText: selectedText,
        fullContext: selectedText,
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

  // Helper functions for language display
  const getLanguageFlag = (lang) => {
    const flags = {
      turkish: '🇹🇷',
      russian: '🇷🇺',
      turkmen: '🇹🇲'
    }
    return flags[lang] || '🌐'
  }

  const getLanguageName = (lang) => {
    const names = {
      turkish: 'Turkish',
      russian: 'Russian',
      turkmen: 'Turkmen'
    }
    return names[lang] || lang
  }

  const toggleViewMode = () => {
    const newMode = viewMode === 'single' ? 'scroll' : 'single'
    setViewMode(newMode)
    console.log('View mode changed to:', newMode)
  }

  // Function to get word explanation from Gemini API
  const getWordExplanation = async (word, context) => {
    if (!word || word.trim().length === 0) return

    setIsLoadingExplanation(true)
    console.log('Requesting explanation for word:', word)

    try {
      const response = await fetch('http://localhost:3001/api/explain-word', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: word.trim(),
          context: context,
          selectedText: selectedText,
          secondaryLanguage: secondaryLanguage
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      setWordExplanation(data)
      setShowContextual(false) // Start with dictionary view
      console.log('Word explanation received:', data)

    } catch (error) {
      console.error('Error getting word explanation:', error)
      setWordExplanation({
        word: word,
        dictionary: 'Unable to get definition at this time',
        contextual: 'Unable to analyze context at this time',
        error: true
      })
    } finally {
      setIsLoadingExplanation(false)
    }
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

        {/* Language Selection */}
        <div className="language-controls">
          <div className="language-selector">
            <Languages size={16} />
            <select
              value={secondaryLanguage}
              onChange={(e) => setSecondaryLanguage(e.target.value)}
              className="language-select"
            >
              <option value="turkish">🇹🇷 Turkish</option>
              <option value="russian">🇷🇺 Russian</option>
              <option value="turkmen">🇹🇲 Turkmen</option>
            </select>
          </div>
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
                setWordExplanation(null)
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
              <span className="info-badge context-badge">📄 Multi-line Context</span>
            </div>
          </div>
        </div>
      )}

      {/* Word Explanation Display */}
      {wordExplanation && (
        <div className="word-explanation-display">
          <div className="explanation-header">
            <h4>🔍 Word Explanation: <strong>{wordExplanation.word}</strong></h4>
            <div className="explanation-controls">
              <button
                onClick={() => setShowContextual(false)}
                className={`explanation-toggle ${!showContextual ? 'active' : ''}`}
              >
                <BookOpen size={16} />
                Dictionary
              </button>
              <button
                onClick={() => setShowContextual(true)}
                className={`explanation-toggle ${showContextual ? 'active' : ''}`}
              >
                <MessageCircle size={16} />
                In Context
              </button>
            </div>
          </div>
          <div className="explanation-content">
            {isLoadingExplanation ? (
              <div className="loading-explanation">
                <div className="loading-spinner"></div>
                <p>Getting explanation...</p>
              </div>
            ) : (
              <div className="explanation-text">
                {showContextual ? (
                  <div className="contextual-explanation">
                    <h5>📝 Meaning in Context:</h5>
                    <p>"{wordExplanation.context}"</p>
                    <div className="language-explanations">
                      <div className="explanation-box primary">
                        <h6>🇺🇸 English:</h6>
                        <p>{wordExplanation.contextualEnglish}</p>
                      </div>
                      <div className="explanation-box secondary">
                        <h6>{getLanguageFlag(wordExplanation.secondaryLanguage)} {getLanguageName(wordExplanation.secondaryLanguage)}:</h6>
                        <p>{wordExplanation.contextualSecondary}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dictionary-explanation">
                    <h5>📚 Dictionary Definition:</h5>
                    <div className="language-explanations">
                      <div className="explanation-box primary">
                        <h6>🇺🇸 English:</h6>
                        <p>{wordExplanation.dictionaryEnglish}</p>
                      </div>
                      <div className="explanation-box secondary">
                        <h6>{getLanguageFlag(wordExplanation.secondaryLanguage)} {getLanguageName(wordExplanation.secondaryLanguage)}:</h6>
                        <p>{wordExplanation.dictionarySecondary}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
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
