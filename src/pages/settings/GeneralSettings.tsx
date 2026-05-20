import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function GeneralSettings() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil da Empresa</CardTitle>
          <CardDescription>Informações gerais sobre a conta da empresa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da Empresa</Label>
            <Input id="companyName" defaultValue="Central Celular Corporativo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">E-mail de Suporte</Label>
            <Input id="supportEmail" defaultValue="suporte@centralcell.corp" type="email" />
          </div>
          <Button>Salvar Alterações</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências do Sistema</CardTitle>
          <CardDescription>Configure como o sistema deve se comportar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-2xl">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notifications" className="flex flex-col space-y-1">
              <span className="text-base font-medium">Notificações Sonoras</span>
              <span className="font-normal text-sm text-muted-foreground">
                Tocar som ao receber nova mensagem ou alerta.
              </span>
            </Label>
            <Switch id="notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="darkMode" className="flex flex-col space-y-1">
              <span className="text-base font-medium">Tema Escuro Automático</span>
              <span className="font-normal text-sm text-muted-foreground">
                Sincronizar com as preferências do sistema operacional.
              </span>
            </Label>
            <Switch id="darkMode" defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
