import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Upload, X, FileSignature } from 'lucide-react'
import { SignatureManagerDialog } from '@/components/SignatureManagerDialog'

export default function GeneralSettings() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [signature, setSignature] = useState(user?.signature || '')

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isSignatureManagerOpen, setIsSignatureManagerOpen] = useState(false)

  const handleSaveCompany = async () => {
    toast({
      title: 'Perfil Atualizado',
      description: 'As configurações da empresa foram salvas com sucesso.',
    })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5242880) {
        toast({
          title: 'Erro de validação',
          description: 'A imagem deve ter no máximo 5MB',
          variant: 'destructive',
        })
        if (fileInputRef.current) fileInputRef.current.value = ''
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user) return
    try {
      setIsUploading(true)
      await pb.collection('users').update(user.id, { avatar: null })
      await pb.collection('users').authRefresh()
      setAvatarFile(null)
      setAvatarPreview(null)
      toast({ title: 'Sucesso', description: 'Foto de perfil removida com sucesso.' })
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Não foi possível remover a foto.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSaveUserProfile = async () => {
    if (!user) return
    try {
      setIsUploading(true)
      const formData = new FormData()
      formData.append('name', name)
      formData.append('username', username)
      formData.append('signature', signature)
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      await pb.collection('users').update(user.id, formData)
      await pb.collection('users').authRefresh()

      setAvatarFile(null)
      setAvatarPreview(null)
      toast({ title: 'Sucesso', description: 'Perfil de usuário atualizado com sucesso.' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: e.message || 'Não foi possível salvar as informações do perfil.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const currentAvatarUrl = user?.avatar ? pb.files.getURL(user, user.avatar) : undefined
  const displayAvatar = avatarPreview || currentAvatarUrl
  const userInitials = (user?.name?.[0] || user?.username?.[0] || 'U').toUpperCase()

  return (
    <div className="grid gap-6 pb-12">
      <Card>
        <CardHeader>
          <CardTitle>Perfil do Usuário</CardTitle>
          <CardDescription>Informações pessoais e foto de perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-24 w-24 border border-white/10 shadow-lg">
                <AvatarImage src={displayAvatar} alt={user?.name} className="object-cover" />
                <AvatarFallback className="bg-black/40 text-foreground text-2xl font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Trocar
                </Button>
                {(user?.avatar || avatarPreview) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    onClick={handleRemoveAvatar}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
              />
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-2">
                <Label htmlFor="userName">Nome</Label>
                <Input
                  id="userName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userUsername">Nome de Usuário</Label>
                <Input
                  id="userUsername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="userSignature">Assinatura Pessoal</Label>
                <textarea
                  id="userSignature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Ex: Atendente João"
                  className="w-full flex min-h-[80px] rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[14px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 resize-y text-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Será incluída no topo de suas mensagens.
                </p>
              </div>
              <Button onClick={handleSaveUserProfile} disabled={isUploading}>
                {isUploading ? 'Salvando...' : 'Salvar Perfil'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
          <Button onClick={handleSaveCompany} disabled={isUploading}>
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assinaturas de Instâncias</CardTitle>
          <CardDescription>
            Configure a assinatura de apresentação para cada número do WhatsApp conectado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-w-2xl">
          <p className="text-sm text-muted-foreground">
            Personalize a assinatura que será enviada junto com suas mensagens para cada aparelho
            celular. Isso ajuda na identificação do atendente e melhora a comunicação corporativa.
          </p>
          <Button
            onClick={() => setIsSignatureManagerOpen(true)}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <FileSignature className="mr-2 h-4 w-4" />
            Gerenciar Assinaturas
          </Button>
        </CardContent>
      </Card>

      <SignatureManagerDialog
        open={isSignatureManagerOpen}
        onOpenChange={setIsSignatureManagerOpen}
      />

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
