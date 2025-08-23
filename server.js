import express from 'express'
import cors from 'cors'

const app = express()
const port = 3001

app.use(cors())
app.use(express.json())

// Mock translation function - replace with real translation API
const mockTranslate = (text, targetLanguage) => {
  const translations = {
    'hello': { en: 'hello', es: 'hola', fr: 'bonjour', de: 'hallo' },
    'world': { en: 'world', es: 'mundo', fr: 'monde', de: 'welt' },
    'good': { en: 'good', es: 'bueno', fr: 'bon', de: 'gut' },
    'morning': { en: 'morning', es: 'mañana', fr: 'matin', de: 'morgen' },
    'thank': { en: 'thank', es: 'gracias', fr: 'merci', de: 'danke' },
    'you': { en: 'you', es: 'tú', fr: 'vous', de: 'du' }
  }
  
  const words = text.toLowerCase().split(' ')
  const translatedWords = words.map(word => {
    const cleanWord = word.replace(/[^\w]/g, '')
    return translations[cleanWord]?.[targetLanguage] || cleanWord
  })
  
  return translatedWords.join(' ')
}

app.post('/api/translate', (req, res) => {
  const { text, targetLanguage } = req.body
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' })
  }
  
  try {
    const translation = mockTranslate(text, targetLanguage || 'en')
    res.json({ translation })
  } catch (error) {
    res.status(500).json({ error: 'Translation failed' })
  }
})

app.listen(port, () => {
  console.log(`Translation server running on port ${port}`)
})
