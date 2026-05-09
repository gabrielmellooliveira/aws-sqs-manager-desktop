import { useState, useEffect, useCallback } from 'react'
import QueueInput from './components/QueueInput'
import MessageList from './components/MessageList'
import type { SQSMessage, SQSConfig } from './types'
import './App.css'

export default function App() {
  const [messages, setMessages] = useState<SQSMessage[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [queueUrl, setQueueUrl] = useState<string | null>(null)

  useEffect(() => {
    const unsubMessages = window.sqsAPI?.onMessages((newMessages) => {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.MessageId))
        const fresh = newMessages.filter((m) => !existingIds.has(m.MessageId))
        return fresh.length > 0 ? [...fresh.reverse(), ...prev] : prev
      })
    })

    const unsubError = window.sqsAPI?.onError((err) => {
      setError(err)
    })

    return () => {
      unsubMessages?.()
      unsubError?.()
    }
  }, [])

  const handleStart = useCallback(async (config: SQSConfig) => {
    setError(null)
    setIsLoading(true)
    const result = await window.sqsAPI?.start(config)
    setIsLoading(false)

    if (result?.success) {
      setIsListening(true)
      setQueueUrl(result.queueUrl ?? config.arn)
    } else {
      setError(result?.error ?? 'Erro desconhecido ao conectar')
    }
  }, [])

  const handleStop = useCallback(async () => {
    await window.sqsAPI?.stop()
    setIsListening(false)
    setQueueUrl(null)
  }, [])

  const handleClear = useCallback(() => setMessages([]), [])

  return (
    <div className="app-layout">
      <div className="titlebar-drag" />

      <div className="content">
        <QueueInput
          onStart={handleStart}
          onStop={handleStop}
          isListening={isListening}
          isLoading={isLoading}
        />

        {queueUrl && (
          <div className="queue-url-bar">
            <span className="queue-url-label">URL:</span>
            <span className="queue-url-value" title={queueUrl}>{queueUrl}</span>
          </div>
        )}

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
            <button className="error-close" onClick={() => setError(null)}>✕</button>
          </div>
        )}

        <MessageList messages={messages} onClear={handleClear} />
      </div>
    </div>
  )
}
