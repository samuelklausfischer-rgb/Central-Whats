import { ChatThread, Device } from '@/stores/useAppStore'
import { ArrowLeft, Search, Smartphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  devices: Device[]
  selectedDeviceId: string
  onDeviceChange: (id: string) => void
  threads: ChatThread[]
  selectedId: string | null
  onSelect: (id: string) => void
  onBack: () => void
  isMobile: boolean
}

export function ChatList({
  devices,
  selectedDeviceId,
  onDeviceChange,
  threads,
  selectedId,
  onSelect,
  onBack,
  isMobile,
}: Props) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-card border-r w-full md:w-[380px] flex-shrink-0">
      <div className="p-4 border-b space-y-4 bg-muted/20">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold text-lg">Conversas</h2>
        </div>

        <Select value={selectedDeviceId} onValueChange={onDeviceChange}>
          <SelectTrigger className="w-full bg-background border-input shadow-sm h-11">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Selecione um aparelho" />
            </div>
          </SelectTrigger>
          <SelectContent>
            {devices.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name} ({d.department})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar ou começar uma nova conversa"
            className="pl-9 bg-background h-9 rounded-full text-sm shadow-none border-input"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="text-sm">Nenhuma conversa encontrada neste aparelho</p>
          </div>
        ) : (
          threads.map((thread) => {
            const lastMsg = thread.messages[thread.messages.length - 1]
            return (
              <button
                key={thread.id}
                onClick={() => onSelect(thread.id)}
                className={`w-full flex items-start gap-3 p-3 transition-colors text-left border-b border-border/50 ${
                  selectedId === thread.id
                    ? 'bg-muted/80'
                    : 'hover:bg-muted/40 bg-white dark:bg-card'
                }`}
              >
                <Avatar className="h-12 w-12 border shadow-sm">
                  <AvatarImage src={thread.avatar} alt={thread.contactName} />
                  <AvatarFallback>{thread.contactName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <p
                      className={`text-[15px] truncate ${thread.unread && selectedId !== thread.id ? 'font-bold' : 'font-medium'}`}
                    >
                      {thread.contactName}
                    </p>
                    <span
                      className={`text-xs whitespace-nowrap ml-2 ${thread.unread && selectedId !== thread.id ? 'text-emerald-500 font-medium' : 'text-muted-foreground'}`}
                    >
                      {lastMsg?.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-sm truncate ${thread.unread && selectedId !== thread.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                    >
                      {lastMsg?.sender === 'me' ? 'Você: ' : ''}
                      {lastMsg?.text}
                    </p>
                    {thread.unread && selectedId !== thread.id && (
                      <div className="h-5 min-w-[20px] rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white px-1.5 flex-shrink-0">
                        1
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
