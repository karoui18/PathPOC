'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFolderContext } from '../context/FolderContext'

type Slide = {
  id: number
  filename: string
  created_at: string
  folder_id: number | null
  folder_name: string | null
}

export default function Dashboard() {
  const { selectedFolderId } = useFolderContext()
  const [slides, setSlides] = useState<Slide[]>([])
  const [sortField, setSortField] = useState<'id' | 'filename' | 'created_at'>('created_at')
  const [sortAsc, setSortAsc] = useState(false)

  // Fetch slides when folder filter changes
  useEffect(() => {
    let url = 'http://localhost:8000/slides'
    if (selectedFolderId !== null) {
      url += `?folder_id=${selectedFolderId}`
    }
    fetch(url)
      .then(res => res.json())
      .then(setSlides)
  }, [selectedFolderId])

  // Sorting logic
  const sortedSlides = [...slides].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]
    if (aValue < bValue) return sortAsc ? -1 : 1
    if (aValue > bValue) return sortAsc ? 1 : -1
    return 0
  })

  const toggleSort = (field: typeof sortField) => {
    if (field === sortField) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {selectedFolderId ? `Slides in Folder #${selectedFolderId}` : 'All Slides'}
      </h1>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-700 text-left">
            <th className="p-2 cursor-pointer" onClick={() => toggleSort('id')}>
              ID {sortField === 'id' && (sortAsc ? '↑' : '↓')}
            </th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort('filename')}>
              Name {sortField === 'filename' && (sortAsc ? '↑' : '↓')}
            </th>
            <th className="p-2">Folder</th>
            <th className="p-2 cursor-pointer" onClick={() => toggleSort('created_at')}>
              Created {sortField === 'created_at' && (sortAsc ? '↑' : '↓')}
            </th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedSlides.map(slide => (
            <tr key={slide.id} className="border-t hover:bg-gray-50">
              <td className="p-2">{slide.id}</td>
              <td className="p-2">{slide.filename}</td>
              <td className="p-2">{slide.folder_name ?? '—'}</td>
              <td className="p-2">{new Date(slide.created_at).toLocaleString()}</td>
              <td className="p-2">
                <Link href={`/viewer?slide=${slide.filename}`}>
                  <button className="text-blue-600 underline">View</button>
                </Link>
              </td>
            </tr>
          ))}

          {sortedSlides.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">No slides found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}