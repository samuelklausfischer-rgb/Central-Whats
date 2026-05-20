import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function ChatList({ devices, selectedDeviceId, onSelectDevice, isMobile }: any) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-card border-r w-full md:w-[380px] flex-shrink-0">
      <div className="p-4 border-b space-y-4 bg-muted/20">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold text-xl">Conversas</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar departamento..."
            className="pl-9 bg-background rounded-full h-9"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {devices.map((device: any) => (
          <button
            key={device.id}
            onClick={() => onSelectDevice(device.id)}
            className={`w-full flex items-start gap-3 p-3 text-left border-b transition-colors ${
              selectedDeviceId === device.id ? 'bg-muted/80' : 'hover:bg-muted/40'
            }`}
          >
            <Avatar className="h-12 w-12 border shadow-sm">
              <AvatarFallback>{device.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex justify-between items-baseline mb-0.5">
                <p
                  className={`text-[15px] truncate ${device.unread_count > 0 && selectedDeviceId !== device.id ? 'font-bold' : 'font-medium'}`}
                >
                  {device.name}
                </p>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p
                  className={`text-sm truncate ${device.unread_count > 0 && selectedDeviceId !== device.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                >
                  {device.department} - {device.status === 'online' ? 'Online' : 'Offline'}
                </p>
                {device.unread_count > 0 && selectedDeviceId !== device.id && (
                  <div className="h-5 min-w-[20px] rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white px-1.5 flex-shrink-0">
                    {device.unread_count}
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
