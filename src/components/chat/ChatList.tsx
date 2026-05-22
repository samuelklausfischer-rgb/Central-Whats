import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Check, CheckCheck, Smartphone } from 'lucide-react'

export interface ChatListProps {
  devices: any[]
  selectedDeviceId: string | null
  onSelectDevice: (id: string) => void
  conversations: any[]
  contacts: any[]
  selectedContact: string | null
  onSelectContact: (id: string) => void
  isMobile: boolean
}

export function ChatList({
  devices,
  selectedDeviceId,
  onSelectDevice,
  conversations,
  contacts,
  selectedContact,
  onSelectContact,
  isMobile,
}: ChatListProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full bg-zinc-950/50 border-r border-white/10',
        isMobile ? 'w-full' : 'w-80 lg:w-96',
      )}
    >
      <div className="p-4 border-b border-white/10 flex flex-col gap-4 shrink-0">
        <h2 className="text-xl font-semibold text-white">Mensagens</h2>
        <Select value={selectedDeviceId || undefined} onValueChange={onSelectDevice}>
          <SelectTrigger className="w-full bg-zinc-900 border-white/10 h-14">
            <SelectValue placeholder="Selecione um dispositivo..." />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.id} value={device.id} className="py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-zinc-800">
                    <AvatarImage src={device.avatar_url} />
                    <AvatarFallback>
                      <Smartphone className="h-4 w-4 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-medium leading-none text-zinc-100">
                      {device.name}
                    </span>
                    {device.department && (
                      <span className="text-xs text-muted-foreground mt-1.5">
                        {device.department}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 flex flex-col gap-1">
          {conversations.map((conv) => {
            const contact = contacts.find((c) => c.remote_jid === conv.remote_sender)
            const isSelected = selectedContact === conv.remote_sender
            const name =
              contact?.nickname || contact?.name || conv.sender_name || conv.remote_sender

            return (
              <button
                key={conv.remote_sender}
                onClick={() => onSelectContact(conv.remote_sender)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left w-full hover:bg-white/5',
                  isSelected ? 'bg-white/10' : '',
                )}
              >
                <Avatar className="h-12 w-12 border border-white/10 bg-zinc-800">
                  <AvatarImage src={contact?.avatar_url} />
                  <AvatarFallback className="text-zinc-400">
                    {name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-medium text-zinc-100 truncate pr-2">{name}</h3>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {format(new Date(conv.lastMessage.created), 'HH:mm')}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {conv.lastMessage.direction === 'outbound' &&
                      (conv.lastMessage.is_read ? (
                        <CheckCheck className="h-3 w-3 text-blue-400 shrink-0" />
                      ) : (
                        <Check className="h-3 w-3 text-zinc-500 shrink-0" />
                      ))}
                    <p
                      className={cn(
                        'text-sm truncate',
                        conv.unread_count > 0 ? 'text-zinc-100 font-medium' : 'text-zinc-400',
                      )}
                    >
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>

                {conv.unread_count > 0 && (
                  <div className="h-5 min-w-5 rounded-full bg-primary flex items-center justify-center px-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-primary-foreground">
                      {conv.unread_count}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
          {conversations.length === 0 && selectedDeviceId && (
            <div className="text-center p-8 text-muted-foreground text-sm">
              Nenhuma conversa encontrada neste dispositivo.
            </div>
          )}
          {conversations.length === 0 && !selectedDeviceId && (
            <div className="text-center p-8 text-muted-foreground text-sm">
              Selecione um dispositivo para carregar as mensagens.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
