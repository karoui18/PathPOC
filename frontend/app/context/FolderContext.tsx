'use client'
import { createContext, useContext, useState } from 'react'

type FolderContextType = {
  selectedFolderId: number | null
  setSelectedFolderId: (id: number | null) => void
}

const FolderContext = createContext<FolderContextType>({
  selectedFolderId: null,
  setSelectedFolderId: () => {}
})

export const FolderProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null)

  return (
    <FolderContext.Provider value={{ selectedFolderId, setSelectedFolderId }}>
      {children}
    </FolderContext.Provider>
  )
}

export const useFolderContext = () => useContext(FolderContext)
