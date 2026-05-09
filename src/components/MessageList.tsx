import { useState } from 'react'
import type { SQSMessage } from '../types'

interface Props {
  messages: SQSMessage[]
  onClear: () => void
}

function formatBody(body?: string): { parsed: object | null; raw: string } {
  if (!body) return { parsed: null, raw: '' }
  try {
    return { parsed: JSON.parse(body), raw: body }
  } catch {
    return { parsed: null, raw: body }
  }
}

function formatTimestamp(epochMs?: string): string {
  if (!epochMs) return ''
  const date = new Date(Number(epochMs))
  return date.toLocaleString('pt-BR')
}

function MessageCard({ message, index }: { message: SQSMessage; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const { parsed, raw } = formatBody(message.Body)
  const sentAt = message.Attributes?.SentTimestamp
  const shortId = message.MessageId?.slice(0, 8) ?? '—'

  return (
    <div className="message-card" onClick={() => setExpanded(!expanded)}>
      <div className="message-header">
        <div className="message-meta">
          <span className="message-index">#{index + 1}</span>
          <span className="message-id" title={message.MessageId}>
            {shortId}…
          </span>
          {sentAt && <span className="message-time">{formatTimestamp(sentAt)}</span>}
        </div>
        <span className={`message-chevron ${expanded ? 'expanded' : ''}`}>›</span>
      </div>

      <div className="message-preview">
        {raw.slice(0, 120)}{raw.length > 120 ? '…' : ''}
      </div>

      {expanded && (
        <div className="message-body" onClick={(e) => e.stopPropagation()}>
          {parsed ? (
            <pre className="code-block">{JSON.stringify(parsed, null, 2)}</pre>
          ) : (
            <pre className="code-block">{raw}</pre>
          )}
          {message.MessageAttributes && Object.keys(message.MessageAttributes).length > 0 && (
            <div className="attributes-section">
              <p className="attributes-title">Atributos</p>
              {Object.entries(message.MessageAttributes).map(([key, val]) => (
                <div key={key} className="attribute-row">
                  <span className="attr-key">{key}</span>
                  <span className="attr-value">{val.StringValue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MessageList({ messages, onClear }: Props) {
  if (messages.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <p className="empty-title">Nenhuma mensagem ainda</p>
        <p className="empty-subtitle">Conecte a uma fila SQS para começar a receber mensagens</p>
      </div>
    )
  }

  return (
    <div className="message-list-container">
      <div className="list-toolbar">
        <span className="list-count">{messages.length} mensagem{messages.length !== 1 ? 's' : ''}</span>
        <button className="btn-ghost" onClick={onClear}>Limpar</button>
      </div>
      <div className="message-list">
        {messages.map((msg, i) => (
          <MessageCard key={msg.MessageId ?? i} message={msg} index={i} />
        ))}
      </div>
    </div>
  )
}
