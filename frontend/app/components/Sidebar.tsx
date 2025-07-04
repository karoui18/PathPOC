'use client'

import { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { useFolderContext } from '../context/FolderContext'
import { useRouter } from 'next/navigation'

export default function Sidebar() {
  const { setSelectedFolderId } = useFolderContext()
  const [folders, setFolders] = useState<any[]>([])

  // Folder modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editFolder, setEditFolder] = useState<any | null>(null)
  const [name, setName] = useState("")

  // Upload modal state
  const [uploadModal, setUploadModal] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [folderId, setFolderId] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)

  const router = useRouter()

  const handleFolderClick = (id: number | null) => {
    setSelectedFolderId(id)
    router.push('/dashboard')
  }

  const loadFolders = () => {
    fetch("http://localhost:8000/folders")
      .then(res => res.json())
      .then(setFolders)
  }

  useEffect(() => {
    loadFolders()
  }, [modalOpen, uploadModal])

  // Create or update folder
  const saveFolder = async () => {
    const method = editFolder ? "PUT" : "POST"
    const url = editFolder ? `/folders/${editFolder.id}` : `/folders`

    await fetch(`http://localhost:8000${url}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    })

    setModalOpen(false)
    setEditFolder(null)
    setName("")
    loadFolders()
  }

  const openEdit = (folder: any) => {
    setEditFolder(folder)
    setName(folder.name)
    setModalOpen(true)
  }

  const handleUpload = async () => {
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder_id', String(folderId ?? ''))

    const xhr = new XMLHttpRequest()
    xhr.open('POST', 'http://localhost:8000/upload')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        setProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        setUploadModal(false)
        setFile(null)
        setProgress(0)
      } else {
        alert('Upload failed')
      }
    }

    xhr.send(formData)
  }

  return (
    <aside className="w-64 bg-gray-700 p-4 border-r h-screen flex flex-col justify-between">
      <div>
        <h1>PATHPOC</h1>
        <hr className="my-2" />
        <button
          onClick={() => setUploadModal(true)}
          className="bg-blue-900 text-white w-full py-2 rounded text-sm">
          Upload WSI
        </button>

        <hr className="my-2" />

        <button
            onClick={() => handleFolderClick(null)}
            className="text-blue-600 mb-4"
            >
            All Slides
        </button>



        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">Folders</span>
          <button onClick={() => {
            setEditFolder(null)
            setName("")
            setModalOpen(true)
          }} className="text-grey-200 text-sm">Add</button>
        </div>

        <ul className="space-y-1 mb-4">
            {folders.map(f => (
                <li key={f.id} className="flex justify-between">
                <button
                    onClick={() => handleFolderClick(f.id)}
                    className="text-blue-800 text-sm text-left"
                >
                    {f.name}
                </button>
                <button onClick={() => openEdit(f)} className="text-gray-500 text-xs">✏</button>
                </li>
            ))}
        </ul>


      </div>

      {/* Folder Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex justify-center items-center">
          <Dialog.Panel className="bg-blue-900 p-6 rounded shadow-xl w-full max-w-md">
            <Dialog.Title className="text-xl font-bold mb-4">
              {editFolder ? "Edit Folder" : "New Folder"}
            </Dialog.Title>

            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Folder name"
              className="border p-2 w-full mb-3"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-3 py-2 bg-gray-300 rounded">Cancel</button>
              <button onClick={saveFolder} className="px-3 py-2 bg-blue-600 text-white rounded">
                {editFolder ? "Update" : "Create"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Upload Modal */}
      <Dialog open={uploadModal} onClose={() => setUploadModal(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/40" />
        <div className="fixed inset-0 flex justify-center items-center p-4">
          <Dialog.Panel className="bg-blue-900 p-6 rounded shadow-xl w-full max-w-md">
            <Dialog.Title className="text-lg font-bold mb-4">Upload Whole Slide Image</Dialog.Title>

            <input
              type="file"
              accept=".svs,.ndpi"
              onChange={e => setFile(e.target.files?.[0] ?? null)}
              className="mb-3 w-full"
            />

            <select
              value={folderId ?? ''}
              onChange={e => setFolderId(Number(e.target.value))}
              className="border p-2 w-full mb-3"
            >
              <option value="">Select Folder (optional)</option>
              {folders.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            {progress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button onClick={() => setUploadModal(false)} className="px-3 py-2 rounded bg-gray-300">Cancel</button>
              <button onClick={handleUpload} className="px-3 py-2 rounded bg-blue-600 text-white">Upload</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </aside>
  )
}
