import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { getDevices, updateDevice } from '@/services/devices'
import { getMessages } from '@/services/messages'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

function DeviceSignatureItem({ device }: { device: any }) {
  const [signature, setSignature] = useState(device.signature || '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setSignature(device.signature || '')
  }, [device.signature])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSaving(true)
    try {
      await updateDevice(device.id, { signature })
      toast({ title: 'Assinatura salva', description: `Para ${device.name}` })
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AccordionItem
      value={device.id}
      className="border border-white/10 bg-black/20 rounded-xl px-4 overflow-hidden data-[state=open]:bg-black/30 transition-colors"
    >
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="font-semibold text-foreground tracking-tight">{device.name}</div>
          <Badge
            variant="outline"
            className={
              device.status === 'online'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }
          >
            {device.status === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-2 pb-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Assinatura de Mensagem / Apresentação
            </Label>
            <textarea
              className="w-full flex min-h-[100px] rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[14px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 resize-y text-foreground"
              placeholder="Ex: Atenciosamente,&#10;Equipe de Vendas"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export default function ChatHub() {
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const urlDeviceId = searchParams.get('device')

  const [devices, setDevices] = useState<any[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<string | null>(null)

  useEffect(() => {
    getDevices().then((data) => {
      setDevices(data)
      const savedId = sessionStorage.getItem('activeDeviceId')
      const targetId = urlDeviceId || savedId

      if (targetId && data.some((d) => d.id === targetId)) {
        setSelectedDeviceId(targetId)
      }
    })
  }, [urlDeviceId])

  useRealtime('devices', (e) => {
    if (e.action === 'create') setDevices((prev) => [e.record, ...prev])
    else if (e.action === 'update')
      setDevices((prev) => prev.map((d) => (d.id === e.record.id ? e.record : d)))
    else if (e.action === 'delete') setDevices((prev) => prev.filter((d) => d.id !== e.record.id))
  })

  useEffect(() => {
    if (selectedDeviceId) {
      sessionStorage.setItem('activeDeviceId', selectedDeviceId)
      getMessages(selectedDeviceId).then(setMessages)
      setSelectedContact(null)
    } else {
      setMessages([])
      setSelectedContact(null)
    }
  }, [selectedDeviceId])

  useRealtime('messages', (e) => {
    if (e.record.device_id === selectedDeviceId) {
      if (e.action === 'create') setMessages((prev) => [...prev, e.record])
      else if (e.action === 'update')
        setMessages((prev) => prev.map((m) => (m.id === e.record.id ? e.record : m)))
      else if (e.action === 'delete')
        setMessages((prev) => prev.filter((m) => m.id !== e.record.id))
    }
  })

  const conversations = useMemo(() => {
    const map = new Map<string, any>()
    messages.forEach((m) => {
      const sender = m.remote_sender || 'Desconhecido'
      if (!map.has(sender)) {
        map.set(sender, {
          remote_sender: sender,
          lastMessage: m,
          messages: [],
          unread_count: 0,
        })
      }
      const conv = map.get(sender)
      conv.messages.push(m)
      if (new Date(m.created) > new Date(conv.lastMessage.created)) {
        conv.lastMessage = m
      }
      if (!m.is_read && m.direction === 'inbound') {
        conv.unread_count += 1
      }
    })
    return Array.from(map.values()).sort(
      (a, b) =>
        new Date(b.lastMessage.created).getTime() - new Date(a.lastMessage.created).getTime(),
    )
  }, [messages])

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId)

  const currentConversation = useMemo(() => {
    return conversations.find((c) => c.remote_sender === selectedContact)
  }, [conversations, selectedContact])

  const [isSignaturesModalOpen, setIsSignaturesModalOpen] = useState(false)

  return (
    <div className="h-full w-full relative bg-background/20 backdrop-blur-xl border-white/10 flex rounded-none md:rounded-xl border overflow-hidden shadow-2xl">
      {(!isMobile || !selectedContact) && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-6 left-6 z-50 h-12 w-12 rounded-full shadow-2xl bg-zinc-950/90 border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all hover:scale-105"
          onClick={() => setIsSignaturesModalOpen(true)}
          title="Gerenciar Assinaturas de Dispositivos"
        >
          <Settings2 className="h-5 w-5 text-foreground" />
        </Button>
      )}

      <Dialog open={isSignaturesModalOpen} onOpenChange={setIsSignaturesModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col bg-zinc-950/95 border-white/10 text-foreground backdrop-blur-xl p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle>Assinaturas de Instâncias</DialogTitle>
            <DialogDescription>
              Configure a assinatura de apresentação para cada número do WhatsApp conectado.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6 pb-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {devices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma instância conectada.
                </p>
              ) : (
                devices.map((device) => <DeviceSignatureItem key={device.id} device={device} />)
              )}
            </Accordion>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {(!isMobile || !selectedContact) && (
        <ChatList
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={setSelectedDeviceId}
          conversations={conversations}
          selectedContact={selectedContact}
          onSelectContact={setSelectedContact}
          isMobile={isMobile}
        />
      )}
      {(!isMobile || selectedContact) && (
        <ChatWindow
          device={selectedDevice}
          contact={selectedContact}
          conversation={currentConversation}
          onBack={() => setSelectedContact(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}
