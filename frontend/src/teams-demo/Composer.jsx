import { useState } from 'react'
import Icon from './icons'

/** Zone de saisie : le message s'ajoute à la conversation (rien n'est envoyé). */
export default function Composer({ onSend }) {
  const [text, setText] = useState('')
  const send = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    onSend(text.trim())
    setText('')
  }
  return (
    <form className="tm-composer" onSubmit={send}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Tapez un message" />
      <div className="tm-composer__tools">
        <Icon name="format" size={18} />
        <Icon name="emoji" size={18} />
        <Icon name="attach" size={18} />
        <button type="submit" className="tm-icon-button" aria-label="Envoyer" disabled={!text.trim()}>
          <Icon name="send" size={18} />
        </button>
      </div>
    </form>
  )
}
