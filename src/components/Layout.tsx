import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'

export default function Layout() {
  const location = useLocation()
  const isChat = location.pathname.startsWith('/chat')

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col w-full flex-1 overflow-hidden transition-all duration-300 ease-in-out">
          <Header />
          <main
            className={`flex-1 overflow-hidden animate-fade-in-up flex flex-col ${isChat ? '' : 'p-4 md:p-6 lg:p-8'}`}
          >
            <div className={`mx-auto w-full h-full ${isChat ? 'max-w-none' : 'max-w-7xl'}`}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
