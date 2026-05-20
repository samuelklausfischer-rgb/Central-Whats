import { ChatThread } from '@/stores/useAppStore'
import { ArrowLeft, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface Props {
  threads: ChatThread[]
  selectedId: string | null
  onSelect: (id: string) => void
  onBack: () => void
  isMobile: boolean
}

export function ChatList({ threads, selectedId, onSelect, onBack, isMobile }: Props) {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-card border-r w-full md:w-80 flex-shrink-0">
      <div className="p-4 border-b space-y-4">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="font-semibold text-lg">Conversas</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar contatos..." className="pl-9 bg-muted/50 border-none" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        ) : (
          threads.map((thread) => {
            const lastMsg = thread.messages[thread.messages.length - 1]
            return (
              <button
                key={thread.id}
                onClick={() => onSelect(thread.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left ${
                  selectedId === thread.id ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
              >
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={thread.avatar} alt={thread.contactName} />
                  <AvatarFallback>{thread.contactName.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <p
                      className={`font-medium text-sm truncate ${thread.unread && selectedId !== thread.id ? 'font-bold' : ''}`}
                    >
                      {thread.contactName}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {lastMsg?.timestamp}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${thread.unread && selectedId !== thread.id ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                  >
                    {lastMsg?.sender === 'me' ? 'Você: ' : ''}
                    {lastMsg?.text}
                  </p>
                </div>
                {thread.unread && selectedId !== thread.id && (
                  <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
