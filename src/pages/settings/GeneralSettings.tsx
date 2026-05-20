import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function GeneralSettings() {
  const { user } = useAuth()
  const [localSignature, setLocalSignature] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    if (user?.signature) {
      setLocalSignature(user.signature)
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!user) return
    try {
      await pb.collection('users').update(user.id, { signature: localSignature })
      await pb.collection('users').authRefresh()
      toast({
        title: 'Perfil Atualizado',
        description: 'As configurações do perfil foram salvas com sucesso.',
      })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o perfil.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil da Empresa</CardTitle>
          <CardDescription>
            Informações gerais sobre a corporação e controle interno.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome do Departamento Gestor</Label>
            <Input id="companyName" defaultValue="Operações Centrais" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">E-mail de Suporte</Label>
            <Input id="supportEmail" defaultValue="suporte@centralcell.corp" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="userSignature">Assinatura de Mensagem / Apresentação</Label>
            <Input
              id="userSignature"
              placeholder="Ex: Maria - PRN Camboriú"
              value={localSignature}
              onChange={(e) => setLocalSignature(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Esta assinatura será incluída automaticamente no início de todas as suas mensagens.
            </p>
          </div>
          <Button onClick={handleSaveProfile}>Salvar Alterações</Button>
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
