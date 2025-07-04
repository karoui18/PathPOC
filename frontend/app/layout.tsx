// app/layout.tsx
import './globals.css'
import { FolderProvider } from './context/FolderContext'
import Sidebar from './components/Sidebar'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen">
        <FolderProvider>
          <Sidebar />
          <main className="flex-1 p-4 bg-white overflow-auto">{children}</main>
        </FolderProvider>
      </body>
    </html>
  )
}
