import { useState } from 'react'
import type { SQSConfig } from '../types'

interface Props {
  onStart: (config: SQSConfig) => void
  onStop: () => void
  isListening: boolean
  isLoading: boolean
}

export default function QueueInput({ onStart, onStop, isListening, isLoading }: Props) {
  const [arn, setArn] = useState('')
  const [showCreds, setShowCreds] = useState(false)
  const [accessKeyId, setAccessKeyId] = useState('')
  const [secretAccessKey, setSecretAccessKey] = useState('')
  const [region, setRegion] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!arn.trim()) return
    onStart({ arn: arn.trim(), region: region.trim() || undefined, accessKeyId: accessKeyId.trim() || undefined, secretAccessKey: secretAccessKey.trim() || undefined })
  }

  return (
    <div className="queue-input-container">
      <div className="queue-input-header">
        <div className="logo">
          <img src="/icon.png" className="logo-icon" alt="SQS" />
          <span className="logo-text">SQS Manager</span>
        </div>
        <div className="status-badge">
          {isListening ? (
            <span className="badge badge-active">
              <span className="pulse" />
              Ouvindo
            </span>
          ) : (
            <span className="badge badge-idle">Parado</span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="queue-form">
        <div className="field-group">
          <label htmlFor="arn-input" className="field-label">
            ARN ou URL da fila SQS
          </label>
          <div className="input-row">
            <input
              id="arn-input"
              type="text"
              className="text-input"
              placeholder="arn:aws:sqs:us-east-1:123456789012:minha-fila"
              value={arn}
              onChange={(e) => setArn(e.target.value)}
              disabled={isListening || isLoading}
            />
            {isListening ? (
              <button type="button" className="btn btn-danger" onClick={onStop}>
                Parar
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={!arn.trim() || isLoading}>
                {isLoading ? <span className="spinner" /> : 'Conectar'}
              </button>
            )}
          </div>
        </div>

        <button
          type="button"
          className="toggle-creds"
          onClick={() => setShowCreds(!showCreds)}
          disabled={isListening}
        >
          {showCreds ? '▲' : '▼'} Credenciais AWS (opcional)
        </button>

        {showCreds && (
          <div className="creds-grid">
            <div className="field-group">
              <label className="field-label">Region</label>
              <input
                type="text"
                className="text-input"
                placeholder="us-east-1"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={isListening}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Access Key ID</label>
              <input
                type="text"
                className="text-input"
                placeholder="AKIAIOSFODNN7EXAMPLE"
                value={accessKeyId}
                onChange={(e) => setAccessKeyId(e.target.value)}
                disabled={isListening}
              />
            </div>
            <div className="field-group">
              <label className="field-label">Secret Access Key</label>
              <input
                type="password"
                className="text-input"
                placeholder="••••••••••••••••••••"
                value={secretAccessKey}
                onChange={(e) => setSecretAccessKey(e.target.value)}
                disabled={isListening}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
