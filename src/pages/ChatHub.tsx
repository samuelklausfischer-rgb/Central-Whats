import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import useAppStore from '@/stores/useAppStore'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function ChatHub() {
  const isMobile = useIsMobile()
  const { devices, threads } = useAppStore()

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>(devices[0]?.id || '')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const activeDeviceThreads = threads.filter((t) => t.deviceId === selectedDeviceId)
  const activeThread = threads.find((t) => t.id === selectedThreadId) || null

  const handleDeviceChange = (id: string) => {
    setSelectedDeviceId(id)
    setSelectedThreadId(null)
  }

  // Mobile routing logic
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm border flex">
        {!selectedThreadId ? (
          <ChatList
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={handleDeviceChange}
            threads={activeDeviceThreads}
            selectedId={selectedThreadId}
            onSelect={setSelectedThreadId}
            onBack={() => {}}
            isMobile={true}
          />
        ) : (
          <ChatWindow
            thread={activeThread}
            onBack={() => setSelectedThreadId(null)}
            isMobile={true}
          />
        )}
      </div>
    )
  }

  // Desktop routing logic (WhatsApp Web style - 2 columns)
  return (
    <div className="h-[calc(100vh-8rem)] w-full bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm border flex">
      <ChatList
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        onDeviceChange={handleDeviceChange}
        threads={activeDeviceThreads}
        selectedId={selectedThreadId}
        onSelect={setSelectedThreadId}
        onBack={() => {}}
        isMobile={false}
      />
      <ChatWindow thread={activeThread} onBack={() => {}} isMobile={false} />
    </div>
  )
}
