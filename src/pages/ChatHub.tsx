import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { getDevices } from '@/services/devices'
import { getMessages } from '@/services/messages'
import { useRealtime } from '@/hooks/use-realtime'

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
      } else if (data.length > 0 && !targetId) {
        // We can leave it null to show empty state, or auto-select the first one
        // For now, let's respect the "select an instance" empty state requirement
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

  return (
    <div className="h-full w-full bg-background/20 backdrop-blur-xl border-white/10 flex rounded-none md:rounded-xl border overflow-hidden shadow-2xl">
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
