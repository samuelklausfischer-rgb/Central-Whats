import { Smartphone, ChevronRight } from 'lucide-react'
import { Device } from '@/stores/useAppStore'
import { Badge } from '@/components/ui/badge'

interface Props {
  devices: Device[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function DeviceSelector({ devices, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-card border-r w-full md:w-72 flex-shrink-0">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Aparelhos</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {devices.map((device) => (
          <button
            key={device.id}
            onClick={() => onSelect(device.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
              selectedId === device.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-full ${selectedId === device.id ? 'bg-white/20' : 'bg-primary/10 text-primary'}`}
              >
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{device.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`h-2 w-2 rounded-full ${device.status === 'online' ? 'bg-emerald-400' : 'bg-slate-300'}`}
                  ></span>
                  <span
                    className={`text-xs ${selectedId === device.id ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                  >
                    {device.status === 'online' ? 'Conectado' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
            {device.unreadCount > 0 && (
              <Badge
                variant="secondary"
                className={`${selectedId === device.id ? 'bg-white text-primary' : 'bg-primary text-primary-foreground'}`}
              >
                {device.unreadCount}
              </Badge>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
