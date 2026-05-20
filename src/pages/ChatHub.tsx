import { useState } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import useAppStore from '@/stores/useAppStore'
import { DeviceSelector } from '@/components/chat/DeviceSelector'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'

export default function ChatHub() {
  const isMobile = useIsMobile()
  const { devices, threads } = useAppStore()

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)

  const activeDeviceThreads = threads.filter((t) => t.deviceId === selectedDeviceId)
  const activeThread = threads.find((t) => t.id === selectedThreadId) || null

  const handleDeviceSelect = (id: string) => {
    setSelectedDeviceId(id)
    setSelectedThreadId(null) // Reset thread when changing device
  }

  // Mobile routing logic
  if (isMobile) {
    return (
      <div className="h-[calc(100vh-8rem)] w-full bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm border flex">
        {!selectedDeviceId && (
          <DeviceSelector
            devices={devices}
            selectedId={selectedDeviceId}
            onSelect={handleDeviceSelect}
          />
        )}
        {selectedDeviceId && !selectedThreadId && (
          <ChatList
            threads={activeDeviceThreads}
            selectedId={selectedThreadId}
            onSelect={setSelectedThreadId}
            onBack={() => setSelectedDeviceId(null)}
            isMobile={true}
          />
        )}
        {selectedThreadId && (
          <ChatWindow
            thread={activeThread}
            onBack={() => setSelectedThreadId(null)}
            isMobile={true}
          />
        )}
      </div>
    )
  }

  // Desktop routing logic (3 columns)
  return (
    <div className="h-[calc(100vh-8rem)] w-full bg-white dark:bg-card rounded-xl overflow-hidden shadow-sm border flex">
      <DeviceSelector
        devices={devices}
        selectedId={selectedDeviceId}
        onSelect={handleDeviceSelect}
      />

      {selectedDeviceId ? (
        <ChatList
          threads={activeDeviceThreads}
          selectedId={selectedThreadId}
          onSelect={setSelectedThreadId}
          onBack={() => {}}
          isMobile={false}
        />
      ) : (
        <div className="w-80 border-r hidden md:flex items-center justify-center bg-slate-50 dark:bg-card">
          <p className="text-muted-foreground text-sm">Selecione um aparelho</p>
        </div>
      )}

      <ChatWindow thread={activeThread} onBack={() => {}} isMobile={false} />
    </div>
  )
}
