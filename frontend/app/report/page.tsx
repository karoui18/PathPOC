'use client'

import { useEffect, useState } from 'react'

export default function ReportForm() {
  const [folders, setFolders] = useState([])
  const [folderId, setFolderId] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    fetch('http://localhost:8000/folders')
      .then(res => res.json())
      .then(setFolders)
  }, [])

  const handleSubmit = async () => {
    await fetch('http://localhost:8000/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder_id: folderId, content })
    })
    alert("Compte rendu envoyé")
    setContent('')
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Nouveau compte rendu</h1>

      <select value={folderId} onChange={e => setFolderId(e.target.value)} className="border p-2 mb-2 w-full">
        <option value="">Sélectionnez un dossier</option>
        {folders.map(f => (
          <option key={f.id} value={f.id}>{f.name}</option>
        ))}
      </select>

      <textarea value={content} onChange={e => setContent(e.target.value)} className="border p-2 w-full h-40 mb-2" placeholder="Votre compte rendu..." />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
    </div>
  )
}
