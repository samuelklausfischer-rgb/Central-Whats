import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getDevices, updateDevice } from '@/services/devices'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'

export default function GeneralSettings() {
  const { user } = useAuth()
  const [localSignature, setLocalSignature] = useState('')
  const [devices, setDevices] = useState<any[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('')
  const [deviceSignature, setDeviceSignature] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    getDevices().then(setDevices).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedDeviceId) {
      const device = devices.find((d) => d.id === selectedDeviceId)
      setDeviceSignature(device?.signature || '')
    } else {
      setDeviceSignature('')
    }
  }, [selectedDeviceId, devices])

  useEffect(() => {
    if (user?.signature) {
      setLocalSignature(user.signature)
    }
  }, [user])

  const handleSaveDeviceSignature = async () => {
    if (!selectedDeviceId) return
    try {
      await updateDevice(selectedDeviceId, { signature: deviceSignature })
      setDevices((prev) =>
        prev.map((d) => (d.id === selectedDeviceId ? { ...d, signature: deviceSignature } : d)),
      )
      toast({
        title: 'Assinatura Atualizada',
        description: 'A assinatura do dispositivo foi salva com sucesso.',
      })
    } catch (e) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a assinatura do dispositivo.',
        variant: 'destructive',
      })
    }
  }

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
          <CardTitle>Assinaturas por Dispositivo</CardTitle>
          <CardDescription>
            Configure assinaturas de mensagens específicas para cada instância do WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <div className="space-y-2">
            <Label htmlFor="device-select">Instância do WhatsApp</Label>
            <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
              <SelectTrigger id="device-select">
                <SelectValue placeholder="Selecione um dispositivo..." />
              </SelectTrigger>
              <SelectContent>
                {devices.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deviceSignature">Assinatura da Instância</Label>
            <Textarea
              id="deviceSignature"
              placeholder="Digite a assinatura para este dispositivo..."
              value={deviceSignature}
              onChange={(e) => setDeviceSignature(e.target.value)}
              disabled={!selectedDeviceId}
            />
          </div>
          <Button onClick={handleSaveDeviceSignature} disabled={!selectedDeviceId}>
            Salvar Assinatura
          </Button>
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
