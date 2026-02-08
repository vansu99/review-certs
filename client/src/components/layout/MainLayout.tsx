import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { NProgressProvider } from '@/lib/nprogress'

export const MainLayout = () => {
  return (
    <NProgressProvider>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </NProgressProvider>
  )
}
