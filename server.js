import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Load environment variables
dotenv.config()

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

// Function to get word explanation from Gemini AI
const getWordExplanation = async (word, context = '', secondaryLanguage = 'turkish') => {
  try {
    // Language mappings for Gemini
    const languageMap = {
      turkish: 'Turkish',
      russian: 'Russian',
      turkmen: 'Turkmen'
    }

    console.log('Secondary language:', secondaryLanguage)
    console.log('Recieved Context:', context)

    const targetLanguage = languageMap[secondaryLanguage] || 'Russian'

    const prompt = `
      You are a helpful dictionary and language assistant. Your task is to give a very simple explanation for someone learning English (pre-intermediate level). Follow the rules strictly.

      Provide information about the word "${word}" in FOUR parts:

      PART 1 - DICTIONARY DEFINITION (English):
      - Give the part of speech (noun, verb, adjective, etc.)
      - Write the primary meaning(s) in very simple English
      - Add 1-2 very short example sentences in "Example": "Example sentence" format
      - Keep the whole definition to 1–2 sentences maximum

      PART 2 - DICTIONARY DEFINITION (${targetLanguage}):
      - Provide the exact same information as Part 1
      - But translate it into ${targetLanguage}
      - Keep the same format and simplicity

      PART 3 - CONTEXTUAL MEANING (English):
      ${context ? `In the context: "...${context}..."` : `When used generally`}
      - Explain how "${word}" is used here
      - Say its role in the sentence
      - Explain if it has a special meaning in this context
      - Keep the whole explanation between 1 and 5 sentences maximum

      PART 4 - CONTEXTUAL MEANING (${targetLanguage}):
      - Provide the exact same information as Part 3
      - But translate it into ${targetLanguage}
      - Keep the same format and simplicity

      STRICT FORMAT:
      Answer in this exact format and nothing else:
      DICTIONARY_ENGLISH: [English dictionary definition here]
      DICTIONARY_${secondaryLanguage.toUpperCase()}: [${targetLanguage} dictionary definition here]
      CONTEXT_ENGLISH: [English contextual explanation here]
      CONTEXT_${secondaryLanguage.toUpperCase()}: [${targetLanguage} contextual explanation here]
    `;


    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    console.log('Gemini API response:', text)

    // Parse the response with new format
    const dictionaryEnglishMatch = text.match(/DICTIONARY_ENGLISH:\s*(.*)/i)
    const dictionarySecondaryMatch = text.match(new RegExp(`DICTIONARY_${secondaryLanguage.toUpperCase()}:\s*(.*)`, 'i'))
    const contextEnglishMatch = text.match(/CONTEXT_ENGLISH:\s*(.*)/i)
    const contextSecondaryMatch = text.match(new RegExp(`CONTEXT_${secondaryLanguage.toUpperCase()}:\s*(.*)`, 'i'))

    return {
      dictionaryEnglish: dictionaryEnglishMatch ? dictionaryEnglishMatch[1].trim() : 'Definition not available',
      dictionarySecondary: dictionarySecondaryMatch ? dictionarySecondaryMatch[1].trim() : `${targetLanguage} definition not available`,
      contextualEnglish: contextEnglishMatch ? contextEnglishMatch[1].trim() : 'Context explanation not available',
      contextualSecondary: contextSecondaryMatch ? contextSecondaryMatch[1].trim() : `${targetLanguage} context explanation not available`,
      secondaryLanguage: secondaryLanguage,
      fullResponse: text
    }
  } catch (error) {
    console.error('Gemini API error:', error)
    return {
      dictionaryEnglish: 'Unable to get definition at this time',
      dictionarySecondary: 'Unable to get definition at this time',
      contextualEnglish: 'Unable to analyze context at this time',
      contextualSecondary: 'Unable to analyze context at this time',
      secondaryLanguage: secondaryLanguage,
      fullResponse: 'Error occurred'
    }
  }
}

// Legacy translation endpoint (kept for compatibility)
app.post('/api/translate', (req, res) => {
  const { text, targetLanguage } = req.body

  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }

  try {
    // For now, return the original text as "translation"
    // This can be enhanced with actual translation later
    res.json({ translation: text })
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' })
  }
})

// New endpoint for word explanations
app.post('/api/explain-word', async (req, res) => {
  const { word, context, selectedText, secondaryLanguage } = req.body

  if (!word) {
    return res.status(400).json({ error: 'Word is required' })
  }

  try {
    console.log('Explaining word:', word, 'in context:', context, 'secondary language:', secondaryLanguage)

    const explanation = await getWordExplanation(word, context || selectedText, secondaryLanguage || 'russian')

    res.json({
      word: word,
      dictionaryEnglish: explanation.dictionaryEnglish,
      dictionarySecondary: explanation.dictionarySecondary,
      contextualEnglish: explanation.contextualEnglish,
      contextualSecondary: explanation.contextualSecondary,
      context: context || selectedText,
      secondaryLanguage: explanation.secondaryLanguage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Word explanation error:', error)
    res.status(500).json({
      error: 'Failed to get word explanation',
      word: word,
      dictionaryEnglish: 'Unable to get definition at this time',
      dictionarySecondary: 'Unable to get definition at this time',
      contextualEnglish: 'Unable to analyze context at this time',
      contextualSecondary: 'Unable to analyze context at this time',
      secondaryLanguage: secondaryLanguage || 'turkish'
    })
  }
})

app.listen(port, () => {
  console.log(`Translation server running on port ${port}`)
})
