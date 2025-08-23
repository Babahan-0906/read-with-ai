import * as pdfjs from 'pdfjs-dist'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

/**
 * Extract text from a specific page of a PDF using PDF.js directly
 * @param {string} pdfUrl - URL of the PDF file
 * @param {number} pageNumber - Page number (1-indexed)
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractTextFromPage(pdfUrl, pageNumber) {
  try {
    const loadingTask = pdfjs.getDocument(pdfUrl)
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    
    // Combine all text items into a single string
    const textItems = textContent.items.map(item => item.str)
    return textItems.join(' ')
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw error
  }
}

/**
 * Extract text from all pages of a PDF
 * @param {string} pdfUrl - URL of the PDF file
 * @returns {Promise<Array<string>>} - Array of text content for each page
 */
export async function extractTextFromAllPages(pdfUrl) {
  try {
    const loadingTask = pdfjs.getDocument(pdfUrl)
    const pdf = await loadingTask.promise
    const numPages = pdf.numPages
    
    const pageTexts = []
    for (let i = 1; i <= numPages; i++) {
      const pageText = await extractTextFromPage(pdfUrl, i)
      pageTexts.push(pageText)
    }
    
    return pageTexts
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    throw error
  }
}

/**
 * Get text items with positioning information from a PDF page
 * @param {string} pdfUrl - URL of the PDF file
 * @param {number} pageNumber - Page number (1-indexed)
 * @returns {Promise<Array>} - Array of text items with positioning data
 */
export async function getTextItemsWithPosition(pdfUrl, pageNumber) {
  try {
    const loadingTask = pdfjs.getDocument(pdfUrl)
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()
    
    // Return items with position information
    return textContent.items.map(item => ({
      text: item.str,
      x: item.transform[4],
      y: item.transform[5],
      width: item.width,
      height: item.height,
      fontName: item.fontName,
      fontSize: item.transform[0]
    }))
  } catch (error) {
    console.error('Error getting text items with position:', error)
    throw error
  }
}

/**
 * Search for text within a PDF page
 * @param {string} pdfUrl - URL of the PDF file
 * @param {number} pageNumber - Page number (1-indexed)
 * @param {string} searchText - Text to search for
 * @returns {Promise<Array>} - Array of matching text items with positions
 */
export async function searchTextInPage(pdfUrl, pageNumber, searchText) {
  try {
    const textItems = await getTextItemsWithPosition(pdfUrl, pageNumber)
    const searchLower = searchText.toLowerCase()
    
    return textItems.filter(item => 
      item.text.toLowerCase().includes(searchLower)
    )
  } catch (error) {
    console.error('Error searching text in PDF:', error)
    throw error
  }
}
