import { useRef, useState } from 'react'

/** Glisser-déposer ou bouton pour choisir un ou plusieurs fichiers. */
export default function FileDropZone({ onFiles, accept, label, buttonLabel = 'Choisir un fichier' }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) onFiles([...e.dataTransfer.files])
  }

  return (
    <div
      className={dragging ? 'dropzone dropzone--active' : 'dropzone'}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <span>{label}</span>
      <button type="button" onClick={() => inputRef.current.click()}>
        {buttonLabel}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files.length) onFiles([...e.target.files])
          e.target.value = ''
        }}
      />
    </div>
  )
}
