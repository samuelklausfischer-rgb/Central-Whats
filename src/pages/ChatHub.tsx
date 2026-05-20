import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useIsMobile } from '@/hooks/use-mobile'
import { ChatList } from '@/components/chat/ChatList'
import { ChatWindow } from '@/components/chat/ChatWindow'
import { getDevices } from '@/services/devices'
import { useRealtime } from '@/hooks/use-realtime'

export default function ChatHub() {
  const isMobile = useIsMobile()
  const [searchParams] = useSearchParams()
  const urlDeviceId = searchParams.get('device')

  const [devices, setDevices] = useState<any[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(urlDeviceId)

  useEffect(() => {
    getDevices().then(setDevices)
  }, [])

  useRealtime('devices', (e) => {
    if (e.action === 'create') setDevices((prev) => [e.record, ...prev])
    else if (e.action === 'update')
      setDevices((prev) => prev.map((d) => (d.id === e.record.id ? e.record : d)))
    else if (e.action === 'delete') setDevices((prev) => prev.filter((d) => d.id !== e.record.id))
  })

  return (
    <div className="h-full w-full bg-white dark:bg-card flex rounded-none md:rounded-xl border overflow-hidden shadow-sm">
      {(!isMobile || !selectedDeviceId) && (
        <ChatList
          devices={devices}
          selectedDeviceId={selectedDeviceId}
          onSelectDevice={setSelectedDeviceId}
          isMobile={isMobile}
        />
      )}
      {(!isMobile || selectedDeviceId) && (
        <ChatWindow
          deviceId={selectedDeviceId}
          device={devices.find((d) => d.id === selectedDeviceId)}
          onBack={() => setSelectedDeviceId(null)}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}
