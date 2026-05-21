import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { getDevices } from '@/services/devices'
import { getMessages } from '@/services/messages'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { SignatureManagerDialog } from '@/components/SignatureManagerDialog'

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

      <SignatureManagerDialog
        open={isSignaturesModalOpen}
        onOpenChange={setIsSignaturesModalOpen}
        devices={devices}
      />

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
