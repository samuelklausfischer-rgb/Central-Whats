import { Search, ArrowLeft } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function ChatList({ devices, selectedDeviceId, onSelectDevice, isMobile }: any) {
  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-md border-r border-white/10 w-full md:w-[320px] lg:w-[380px] flex-shrink-0">
      <div className="p-4 border-b border-white/10 space-y-4 bg-white/5">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold text-xl text-foreground tracking-tight">Conversas</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar..."
            className="pl-9 bg-black/40 border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-blue-500/50 rounded-xl"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-1 p-3">
        {devices.map((device: any) => {
          const isSelected = selectedDeviceId === device.id
          const hasUnread = device.unread_count > 0
          return (
            <button
              key={device.id}
              onClick={() => onSelectDevice(device.id)}
              className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-200 border ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
                  : 'border-transparent hover:bg-white/5 hover:border-white/5'
              }`}
            >
              <div className="relative">
                <Avatar
                  className={`h-12 w-12 border ${isSelected ? 'border-blue-500/50' : 'border-white/10 shadow-sm'}`}
                >
                  <AvatarFallback className="bg-black/40 text-foreground font-medium">
                    {device.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${device.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <p
                    className={`text-[15px] truncate ${hasUnread && !isSelected ? 'font-semibold text-white' : 'font-medium text-foreground/90'}`}
                  >
                    {device.name}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-[13px] truncate ${hasUnread && !isSelected ? 'text-foreground/90 font-medium' : 'text-muted-foreground'}`}
                  >
                    {device.department}
                  </p>
                  {hasUnread && !isSelected && (
                    <div className="h-5 min-w-[20px] rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold text-white px-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                      {device.unread_count}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
