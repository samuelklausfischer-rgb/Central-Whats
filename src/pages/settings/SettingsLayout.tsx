import { Link, Outlet, useLocation } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsLayout() {
  const location = useLocation()

  const currentTab = location.pathname.includes('/settings/devices') ? 'devices' : 'general'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie os aparelhos internos e preferências gerais do sistema.
        </p>
      </div>

      <Tabs value={currentTab} className="w-full">
        <TabsList>
          <TabsTrigger value="general" asChild>
            <Link to="/settings/general">Perfil / Geral</Link>
          </TabsTrigger>
          <TabsTrigger value="devices" asChild>
            <Link to="/settings/devices">Aparelhos Corporativos</Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mt-2">
        <Outlet />
      </div>
    </div>
  )
}
