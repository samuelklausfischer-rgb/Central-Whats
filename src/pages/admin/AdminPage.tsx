import { useState, useEffect } from 'react'
import { Plus, ShieldAlert, Smartphone, Trash, Edit, User as UserIcon } from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser } from '@/services/users'
import { getDevices } from '@/services/devices'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function AdminPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  const [users, setUsers] = useState<any[]>([])
  const [devices, setDevices] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    is_admin: false,
    allowed_devices: [] as string[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [uData, dData] = await Promise.all([getUsers(), getDevices()])
      setUsers(uData.filter((u) => u.id !== currentUser?.id))
      setDevices(dData)
    } catch (e) {
      console.error(e)
    }
  }

  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      username: '',
      password: '',
      is_admin: false,
      allowed_devices: [],
    })
    setIsDialogOpen(true)
  }

  const openEditDialog = (user: any) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      username: user.username || '',
      password: '',
      is_admin: user.is_admin || false,
      allowed_devices: user.allowed_devices || [],
    })
    setIsDialogOpen(true)
  }

  const handleDeviceToggle = (deviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      allowed_devices: prev.allowed_devices.includes(deviceId)
        ? prev.allowed_devices.filter((id) => id !== deviceId)
        : [...prev.allowed_devices, deviceId],
    }))
  }

  const handleSave = async () => {
    if (!formData.username.trim()) {
      toast({ title: 'Usuário é obrigatório', variant: 'destructive' })
      return
    }

    try {
      const dataToSave: any = {
        name: formData.name,
        username: formData.username,
        is_admin: formData.is_admin,
        allowed_devices: formData.allowed_devices,
      }

      if (formData.password) {
        dataToSave.password = formData.password
        dataToSave.passwordConfirm = formData.password
      }

      if (editingUser) {
        await updateUser(editingUser.id, dataToSave)
        toast({ title: 'Usuário atualizado com sucesso' })
      } else {
        if (!formData.password) {
          toast({ title: 'A senha é obrigatória', variant: 'destructive' })
          return
        }
        await createUser(dataToSave)
        toast({ title: 'Usuário criado com sucesso' })
      }

      setIsDialogOpen(false)
      loadData()
    } catch (err: any) {
      const fieldErrors = extractFieldErrors(err)
      if (Object.keys(fieldErrors).length > 0) {
        const errorMsg = Object.entries(fieldErrors)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        toast({ title: 'Erro de validação', description: errorMsg, variant: 'destructive' })
      } else {
        toast({ title: 'Erro', description: err.message, variant: 'destructive' })
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return
    try {
      await deleteUser(id)
      toast({ title: 'Usuário removido' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões de acesso aos aparelhos.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-full">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name || 'Sem Nome'}</CardTitle>
                    <CardDescription>@{user.username}</CardDescription>
                  </div>
                </div>
                {user.is_admin && (
                  <Badge
                    variant="outline"
                    className="border-blue-500/30 text-blue-400 bg-blue-500/10 gap-1"
                  >
                    <ShieldAlert className="h-3 w-3" /> Admin
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Smartphone className="h-4 w-4" /> Aparelhos Permitidos
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.is_admin ? (
                      <Badge variant="secondary" className="bg-white/5">
                        Todos os aparelhos
                      </Badge>
                    ) : user.allowed_devices?.length > 0 ? (
                      user.allowed_devices.map((deviceId: string) => {
                        const device = devices.find((d) => d.id === deviceId)
                        return (
                          <Badge key={deviceId} variant="secondary" className="bg-white/5">
                            {device ? device.name : 'Desconhecido'}
                          </Badge>
                        )
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Nenhum</span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(user)}
                    className="h-8"
                  >
                    <Edit className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4 mr-2" /> Remover
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {users.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed border-white/10 rounded-xl">
            Nenhum outro usuário cadastrado no sistema.
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Altere as informações do usuário abaixo.'
                : 'Crie um novo usuário para acessar o sistema.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: João Silva"
                className="bg-black/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Ex: joaosilva"
                className="bg-black/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Senha{' '}
                {editingUser && (
                  <span className="text-muted-foreground font-normal">
                    (Deixe em branco para não alterar)
                  </span>
                )}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="********"
                className="bg-black/50"
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="is_admin"
                checked={formData.is_admin}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_admin: checked as boolean }))
                }
              />
              <Label htmlFor="is_admin" className="font-medium">
                Privilégios de Administrador
              </Label>
            </div>

            {!formData.is_admin && (
              <div className="pt-4 border-t border-white/10">
                <Label className="mb-3 block">Acesso aos Celulares</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {devices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center space-x-2 bg-white/5 p-2 rounded-md"
                    >
                      <Checkbox
                        id={`device-${device.id}`}
                        checked={formData.allowed_devices.includes(device.id)}
                        onCheckedChange={() => handleDeviceToggle(device.id)}
                      />
                      <Label htmlFor={`device-${device.id}`} className="flex-1 cursor-pointer">
                        {device.name}
                      </Label>
                    </div>
                  ))}
                  {devices.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhum aparelho cadastrado.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
