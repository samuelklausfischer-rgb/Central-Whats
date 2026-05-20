import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Devices from './pages/Devices'
import ChatHub from './pages/ChatHub'
import CRM from './pages/CRM'
import Notes from './pages/Notes'
import NotFound from './pages/NotFound'
import Layout from './components/Layout'
import { AppProvider } from './stores/useAppStore'
import SettingsLayout from './pages/settings/SettingsLayout'
import GeneralSettings from './pages/settings/GeneralSettings'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/chat" element={<ChatHub />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/settings" element={<SettingsLayout />}>
              <Route path="devices" element={<Devices />} />
              <Route path="general" element={<GeneralSettings />} />
              <Route index element={<Navigate to="general" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AppProvider>
  </BrowserRouter>
)

export default App
