import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { extractContact, fileDocument } from '../../api/documents'
import { createPosition } from '../../api/positions'
import ChatBubble from './ChatBubble'
import { ACCEPTED_FILES } from '../../utils/recruitment'
import FileDropZone from '../common/FileDropZone'
import FilingForm from './FilingForm'

const WELCOME = {
  id: 'welcome',
  from: 'bot',
  text: 'Bonjour ! Dépose un CV, une lettre ou un diplôme : je lis le nom du candidat (sans IA) et je range le fichier dans Poste / Candidat. Le dossier sera supprimé automatiquement 2 ans après le dernier contact, sauf si le candidat est retenu.',
}

let nextId = 1
const newId = () => nextId++

/**
 * Conversation de dépôt de fichiers.
 * Chaque message est { id, from, text?, link?, filing? } ; `filing` contient le fichier en attente de rangement.
 */
export default function CvChat({ positions, onPositionsChange }) {
  const [messages, setMessages] = useState([WELCOME])
  const [lastPositionId, setLastPositionId] = useState(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    // On fait défiler la conversation seulement, pas toute la page
    const box = messagesRef.current
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const push = (...items) => setMessages((prev) => [...prev, ...items.map((m) => ({ id: newId(), ...m }))])
  const remove = (id) => setMessages((prev) => prev.filter((m) => m.id !== id))

  const handleFiles = async (files) => {
    for (const file of files) {
      push({ from: 'user', text: file.name })
      try {
        const extracted = await extractContact(file)
        push({ from: 'bot', filing: { file, extracted } })
      } catch (e) {
        push({ from: 'bot', text: `Je n'ai pas pu lire « ${file.name} » : ${e.message}` })
      }
    }
  }

  const handleCreatePosition = async (name) => {
    try {
      const position = await createPosition(name)
      await onPositionsChange()
      return position
    } catch (e) {
      push({ from: 'bot', text: e.message })
      return null
    }
  }

  const handleSubmit = async (message, options) => {
    try {
      const result = await fileDocument(message.filing.file, options)
      setLastPositionId(options.positionId)
      remove(message.id)
      push({
        from: 'bot',
        text: `C'est rangé dans ${result.path}${result.new_candidate ? ' (nouveau candidat)' : ''}. Il sera transmis à Talentlink à la prochaine synchronisation.`,
        link: { to: `/candidats/${result.candidate_id}`, label: `Voir le dossier de ${result.candidate_name}` },
      })
      onPositionsChange()
    } catch (e) {
      push({ from: 'bot', text: `Le rangement a échoué : ${e.message}` })
    }
  }

  return (
    <div className="chat">
      <div className="chat__messages" ref={messagesRef}>
        {messages.map((message) => (
          <ChatBubble key={message.id} from={message.from}>
            {message.filing ? (
              <FilingForm
                fileName={message.filing.file.name}
                extracted={message.filing.extracted}
                positions={positions}
                defaultPositionId={lastPositionId}
                onCreatePosition={handleCreatePosition}
                onSubmit={(options) => handleSubmit(message, options)}
              />
            ) : (
              <>
                <p>{message.text}</p>
                {message.link && <Link to={message.link.to}>{message.link.label}</Link>}
              </>
            )}
          </ChatBubble>
        ))}
      </div>
      <FileDropZone
        onFiles={handleFiles}
        accept={ACCEPTED_FILES}
        label="Glisse ici un CV, une lettre ou un diplôme (PDF ou Word)"
      />
    </div>
  )
}
