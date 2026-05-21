import { useState, useEffect } from 'react'
import { Search, ChevronDown, MonitorSmartphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getContactTags } from '@/services/contact_tags'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ChatList({
  devices,
  selectedDeviceId,
  onSelectDevice,
  conversations,
  selectedContact,
  onSelectContact,
}: any) {
  const selectedDevice = devices.find((d: any) => d.id === selectedDeviceId)

  const [deviceTags, setDeviceTags] = useState<any[]>([])

  const loadDeviceTags = async () => {
    if (selectedDeviceId) {
      try {
        const tags = await getContactTags(selectedDeviceId)
        setDeviceTags(tags)
      } catch {
        /* intentionally ignored */
      }
    } else {
      setDeviceTags([])
    }
  }

  useEffect(() => {
    loadDeviceTags()
  }, [selectedDeviceId])

  useRealtime('contact_tags', () => {
    loadDeviceTags()
  })

  return (
    <div className="flex flex-col h-full bg-zinc-950/40 backdrop-blur-2xl border-r border-white/5 w-full md:w-[320px] lg:w-[380px] flex-shrink-0">
      <div className="p-4 border-b border-white/5 space-y-4 bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] z-10 relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-14 bg-black/40 border-white/10 hover:bg-black/60 hover:text-white justify-between px-3 shadow-inner transition-all duration-300"
            >
              {selectedDevice ? (
                <div className="flex items-center gap-3 truncate">
                  <div className="relative flex-shrink-0">
                    <MonitorSmartphone className="h-6 w-6 text-blue-400" />
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-950 ${
                        selectedDevice.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'
                      }`}
                    />
                  </div>
                  <div className="flex flex-col items-start truncate">
                    <span className="font-semibold text-[15px] leading-tight truncate">
                      {selectedDevice.name}
                    </span>
                    <span className="text-[12px] text-muted-foreground flex items-center gap-1">
                      {selectedDevice.department}
                      {selectedDevice.unread_count > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                          {selectedDevice.unread_count}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground truncate">
                  {devices.length === 0
                    ? 'Nenhuma instância configurada'
                    : 'Selecione uma instância...'}
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] bg-zinc-950/95 border-white/10 backdrop-blur-xl">
            {devices.length === 0 ? (
              <div className="p-3 text-sm text-center text-muted-foreground">
                Nenhuma instância configurada
              </div>
            ) : (
              devices.map((device: any) => (
                <DropdownMenuItem
                  key={device.id}
                  onClick={() => onSelectDevice(device.id)}
                  className="flex items-center gap-3 p-3 cursor-pointer focus:bg-white/10"
                >
                  <div className="relative flex-shrink-0">
                    <MonitorSmartphone className="h-5 w-5 text-gray-400" />
                    <div
                      className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
                        device.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm truncate">{device.name}</span>
                      {device.unread_count > 0 && (
                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                          {device.unread_count}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{device.department}</span>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar conversas..."
            className="pl-9 bg-black/40 border-white/10 hover:border-white/20 text-foreground placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-xl transition-all shadow-inner"
            disabled={!selectedDeviceId}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1.5 p-3 custom-scrollbar">
        {!selectedDeviceId ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-60">
            <MonitorSmartphone className="h-10 w-10" />
            <p className="text-sm text-center px-4">
              Selecione uma instância acima para ver as conversas
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-3 opacity-60">
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          conversations.map((conv: any) => {
            const isSelected = selectedContact === conv.remote_sender
            const hasUnread = conv.unread_count > 0

            const lastMsgDate = new Date(conv.lastMessage.created)
            const today = new Date()
            const isToday = lastMsgDate.toDateString() === today.toDateString()
            const timeStr = isToday
              ? lastMsgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : lastMsgDate.toLocaleDateString([], { day: '2-digit', month: '2-digit' })

            return (
              <button
                key={conv.remote_sender}
                onClick={() => onSelectContact(conv.remote_sender)}
                className={`w-full flex items-center gap-3 p-3 text-left rounded-xl transition-all duration-300 border ${
                  isSelected
                    ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_20px_rgba(37,99,235,0.15)]'
                    : 'border-transparent hover:bg-white/5 hover:border-white/10 hover:shadow-lg hover:shadow-black/20'
                }`}
              >
                <Avatar
                  className={`h-12 w-12 border ${isSelected ? 'border-blue-500/50' : 'border-white/10 shadow-sm'}`}
                >
                  <AvatarFallback className="bg-black/40 text-foreground font-medium text-sm">
                    {conv.remote_sender.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p
                      className={`text-[15px] truncate ${
                        hasUnread && !isSelected
                          ? 'font-semibold text-white'
                          : 'font-medium text-foreground/90'
                      }`}
                    >
                      +{conv.remote_sender}
                    </p>
                    <span
                      className={`text-[11px] ${
                        hasUnread && !isSelected
                          ? 'text-blue-400 font-bold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {timeStr}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-[13px] truncate ${
                        hasUnread && !isSelected
                          ? 'text-foreground/90 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {conv.lastMessage.content}
                    </p>
                    {hasUnread && !isSelected && (
                      <div className="h-5 min-w-[20px] rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold text-white px-1.5 flex-shrink-0 shadow-[0_0_10px_rgba(37,99,235,0.4)]">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>

                  {(() => {
                    const contactLabels = deviceTags.filter(
                      (t: any) => t.remote_sender === conv.remote_sender && t.expand?.label_id,
                    )
                    if (contactLabels.length === 0) return null
                    return (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {contactLabels.slice(0, 3).map((t: any) => (
                          <div
                            key={t.id}
                            className="w-2.5 h-2.5 rounded-full shadow-sm border border-black/20"
                            style={{ backgroundColor: t.expand.label_id.color }}
                            title={t.expand.label_id.name}
                          />
                        ))}
                        {contactLabels.length > 3 && (
                          <span className="text-[9px] text-muted-foreground flex items-center">
                            +{contactLabels.length - 3}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
