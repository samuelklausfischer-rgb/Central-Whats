import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { getDevices, syncDeviceAvatar } from '@/services/devices'
import { getMessages } from '@/services/messages'
import { getContacts } from '@/services/contacts'
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
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<string | null>(null)

  useEffect(() => {
    getContacts()
      .then(setContacts)
      .catch(() => {})
    getDevices().then((data) => {
      const activeDevices = data.filter(
        (d) => d.status === 'active' || d.status === 'connected' || d.status === 'open',
      )

      const uniqueDevicesMap = new Map()
      const devicesToProcess = activeDevices.length > 0 ? activeDevices : data

      devicesToProcess.forEach((d) => {
        const key = d.instance_key || d.name
        if (!uniqueDevicesMap.has(key)) {
          uniqueDevicesMap.set(key, d)
        } else {
          const existing = uniqueDevicesMap.get(key)
          if (new Date(d.updated).getTime() > new Date(existing.updated).getTime()) {
            uniqueDevicesMap.set(key, d)
          }
        }
      })
      const filteredDevices = Array.from(uniqueDevicesMap.values())

      setDevices(filteredDevices)
      const savedId = sessionStorage.getItem('activeDeviceId')
      const targetId = urlDeviceId || savedId

      if (targetId && filteredDevices.some((d) => d.id === targetId)) {
        setSelectedDeviceId(targetId)
      } else if (filteredDevices.length > 0) {
        setSelectedDeviceId(filteredDevices[0].id)
      }
    })
  }, [urlDeviceId])

  useRealtime('devices', (e) => {
    if (e.action === 'create') {
      setDevices((prev) => {
        const exists = prev.find(
          (d) =>
            (d.instance_key === e.record.instance_key && e.record.instance_key) ||
            d.name === e.record.name,
        )
        if (exists) return prev.map((d) => (d.id === exists.id ? e.record : d))
        return [e.record, ...prev]
      })
    } else if (e.action === 'update') {
      setDevices((prev) => prev.map((d) => (d.id === e.record.id ? e.record : d)))
    } else if (e.action === 'delete') {
      setDevices((prev) => prev.filter((d) => d.id !== e.record.id))
    }
  })

  useRealtime('contacts', (e) => {
    if (e.action === 'create') setContacts((prev) => [e.record, ...prev])
    else if (e.action === 'update')
      setContacts((prev) => prev.map((c) => (c.id === e.record.id ? e.record : c)))
    else if (e.action === 'delete') setContacts((prev) => prev.filter((c) => c.id !== e.record.id))
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

  useEffect(() => {
    if (selectedDeviceId) {
      const device = devices.find((d) => d.id === selectedDeviceId)
      if (device && (!device.avatar_url || !device.avatar_updated_at)) {
        const syncKey = `synced_device_${device.id}`
        if (!sessionStorage.getItem(syncKey)) {
          sessionStorage.setItem(syncKey, '1')
          syncDeviceAvatar(device.id).catch(() => {})
        }
      }
    }
  }, [selectedDeviceId, devices])

  useRealtime('messages', (e) => {
    if (e.action === 'create' && e.record.direction === 'inbound') {
      const audio = new Audio('/notification.mp3')
      audio.play().catch((err) => {
        console.warn('Could not play notification sound. Browser may be blocking autoplay.', err)
      })
    }

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
      const sender = m.remote_sender || 'Unknown Sender'
      if (!map.has(sender)) {
        map.set(sender, {
          remote_sender: sender,
          sender_name: m.sender_name || '',
          lastMessage: m,
          messages: [],
          unread_count: 0,
        })
      }
      const conv = map.get(sender)
      conv.messages.push(m)
      if (m.sender_name) {
        conv.sender_name = m.sender_name
      }
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
    <div className="h-full w-full relative bg-zinc-950/40 backdrop-blur-2xl border-white/5 flex rounded-none md:rounded-2xl border overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
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
          contacts={contacts}
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
          contacts={contacts}
          onBack={() => setSelectedContact(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}
