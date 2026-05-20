import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Header } from '@/components/Header'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/20">
        <AppSidebar />
        <div className="flex flex-col w-full flex-1 overflow-hidden transition-all duration-300 ease-in-out">
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 animate-fade-in-up">
            <div className="mx-auto max-w-7xl h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
