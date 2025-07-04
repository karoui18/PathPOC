"use client"

import { useEffect, useRef, useState } from "react"
import OpenSeadragon from "openseadragon"
import { Dialog } from "@headlessui/react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

export default function Viewer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<any>(null)

  const [slideId, setSlideId] = useState<string | null>(null)
  const [slideInfo, setSlideInfo] = useState<any>(null)

  const [reports, setReports] = useState<any[]>([])
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const editor = useEditor({ extensions: [StarterKit], content: "" })
  const [title, setTitle] = useState("")

  // Load slide + reports
  useEffect(() => {
    const sid = new URLSearchParams(window.location.search).get("slide")
    if (!sid) return
    setSlideId(sid)

    fetch(`http://localhost:8000/info/${sid}`).then(res => res.json()).then(setSlideInfo)
    fetch(`http://localhost:8000/report/${sid}`).then(res => res.json()).then(setReports)
  }, [])

  // Init viewer
  useEffect(() => {
    if (!slideInfo || !containerRef.current || !slideId) return

    viewerRef.current?.destroy()
    viewerRef.current = OpenSeadragon({
      element: containerRef.current,
      prefixUrl: "/openseadragon/",
      showNavigator: true,
      tileSources: {
        width: slideInfo.width,
        height: slideInfo.height,
        tileSize: slideInfo.tile_size,
        minLevel: 0,
        maxLevel: slideInfo.levels - 1,
        getTileUrl: (level, x, y) =>
          `http://localhost:8000/tiles/${slideId}/${level}/${x}_${y}.jpeg`
      }
    })
  }, [slideInfo])

  const openNewReport = () => {
    setSelectedReport(null)
    setTitle("")
    editor?.commands.setContent("")
    setModalOpen(true)
  }

  const openEditReport = (r: any) => {
    setSelectedReport(r)
    setTitle(r.title)
    editor?.commands.setContent(r.content)
    setModalOpen(true)
  }

  const saveReport = async () => {
    const res = await fetch(`http://localhost:8000/report/${slideId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedReport?.id,
        title,
        content: editor?.getHTML()
      })
    })
    await res.json()
    setModalOpen(false)
    fetch(`http://localhost:8000/report/${slideId}`).then(res => res.json()).then(setReports)
  }

  const printReport = () => {
    const html = editor?.getHTML()
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(`<html><body>${html}</body></html>`)
      w.document.close()
      w.print()
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Viewer</h1>
      <div ref={containerRef} style={{ height: "600px", border: "1px solid #ccc" }} />

      <div className="flex justify-between mt-4">
        <h2 className="text-lg font-semibold">Reports</h2>
        <button onClick={openNewReport} className="bg-green-600 text-white px-4 py-2 rounded">+ New Report</button>
      </div>

      <ul className="space-y-2">
        {reports.map((r) => (
          <li key={r.id} className="flex justify-between items-center border p-2 rounded">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-gray-500">Updated: {new Date(r.updated_at).toLocaleString()}</div>
            </div>
            <button onClick={() => openEditReport(r)} className="bg-blue-600 text-white px-3 py-1 rounded">Edit</button>
          </li>
        ))}
      </ul>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-blue-800 p-6 rounded shadow-xl w-full max-w-3xl">
            <Dialog.Title className="text-xl font-bold mb-2">
              {selectedReport ? "Edit Report" : "New Report"}
            </Dialog.Title>

            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Report Title"
              className="w-full border p-2 mb-2" />

            <EditorContent editor={editor} className="border p-2 min-h-[200px]" />

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={printReport} className="bg-gray-600 text-white px-3 py-2 rounded">Print</button>
              <button onClick={saveReport} className="bg-blue-600 text-white px-3 py-2 rounded">Save</button>
              <button onClick={() => setModalOpen(false)} className="bg-gray-300 px-3 py-2 rounded">Close</button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}
