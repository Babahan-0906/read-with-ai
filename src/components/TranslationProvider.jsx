import React, { createContext, useContext, useState } from 'react'
import { TranslationContext } from '../contexts/TranslationContext'

const TranslationProvider = ({ children }) => {
  const [isTranslating, setIsTranslating] = useState(false)
  const [targetLanguage, setTargetLanguage] = useState('en') // Default to English

  const translate = async (text) => {
    if (!text || text.trim().length === 0) {
      return ''
    }

    setIsTranslating(true)
    
    try {
      // For demo purposes, we'll use a simple translation service
      // In a real application, you would integrate with Google Translate, DeepL, or similar
      const response = await fetch('http://localhost:3001/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          targetLanguage: targetLanguage
        })
      })

      if (!response.ok) {
        throw new Error('Translation request failed')
      }

      const data = await response.json()
      return data.translation
    } catch (error) {
      console.error('Translation error:', error)
      
      // Fallback: return a mock translation for demo purposes
      // In production, you would handle this error appropriately
      return `[Translated: ${text}]`
    } finally {
      setIsTranslating(false)
    }
  }

  const value = {
    translate,
    isTranslating,
    targetLanguage,
    setTargetLanguage
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

export default TranslationProvider
