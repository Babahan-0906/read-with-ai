import React, { useState, useEffect } from 'react'
import { X, Globe, Copy, Check } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'

const TranslationPopup = ({ text, position, onClose, isTranslating }) => {
  const [translation, setTranslation] = useState('')
  const [copied, setCopied] = useState(false)
  const { translate } = useTranslation()

  useEffect(() => {
    const fetchTranslation = async () => {
      if (text) {
        try {
          const result = await translate(text)
          setTranslation(result)
        } catch (error) {
          console.error('Translation error:', error)
          setTranslation('Translation failed')
        }
      }
    }

    fetchTranslation()
  }, [text, translate])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(translation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const popupStyle = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    transform: 'translateX(-50%)',
    zIndex: 1000,
  }

  return (
    <div className="translation-popup" style={popupStyle}>
      <div className="popup-header">
        <div className="popup-title">
          <Globe size={16} />
          <span>Translation</span>
        </div>
        <button onClick={onClose} className="close-button">
          <X size={16} />
        </button>
      </div>
      
      <div className="popup-content">
        <div className="original-text">
          <h4>Original Text:</h4>
          <p>{text}</p>
        </div>
        
        <div className="translated-text">
          <h4>Translation:</h4>
          {isTranslating ? (
            <div className="loading-translation">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <p>Translating...</p>
            </div>
          ) : (
            <div className="translation-result">
              <p>{translation}</p>
              {translation && translation !== 'Translation failed' && (
                <button onClick={handleCopy} className="copy-button">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="popup-arrow"></div>
    </div>
  )
}

export default TranslationPopup
