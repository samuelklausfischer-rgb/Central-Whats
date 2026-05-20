import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  StickyNote,
  KanbanSquare,
  Info,
} from 'lucide-react'
import { ChatThread } from '@/stores/useAppStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

interface Props {
  thread: ChatThread | null
  onBack: () => void
  isMobile: boolean
}

export function ChatWindow({ thread, onBack, isMobile }: Props) {
  const [msgText, setMsgText] = useState('')
  const { addMessage, addLead, markThreadRead } = useAppStore()
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (thread?.unread) {
      markThreadRead(thread.id)
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [thread?.id, thread?.messages.length])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!msgText.trim() || !thread) return
    addMessage(thread.id, msgText)
    setMsgText('')
  }

  const handleAddLead = () => {
    if (!thread) return
    addLead({
      name: thread.contactName,
      status: 'novo',
      value: 0,
      deviceId: thread.deviceId,
      lastNote: 'Lead gerado via Chat Hub',
    })
    toast({
      title: 'Lead Adicionado',
      description: `${thread.contactName} foi adicionado ao CRM.`,
    })
  }

  if (!thread) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-card flex-1">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <MessageSquare className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-medium text-foreground">Central de Mensagens</h2>
        <p className="text-muted-foreground mt-2">
          Selecione uma conversa para começar a enviar mensagens.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#EFEAE2] dark:bg-card flex-1 relative">
      {/* Chat Header */}
      <div className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={thread.avatar} />
            <AvatarFallback>{thread.contactName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm leading-none">{thread.contactName}</h3>
            <p className="text-xs text-muted-foreground mt-1">{thread.contactNumber}</p>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Opções do Contato</SheetTitle>
            </SheetHeader>
            <div className="py-6 flex flex-col items-center border-b">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={thread.avatar} />
                <AvatarFallback className="text-2xl">
                  {thread.contactName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl">{thread.contactName}</h3>
              <p className="text-muted-foreground">{thread.contactNumber}</p>
            </div>
            <div className="py-6 space-y-4">
              <Button className="w-full justify-start" variant="outline" onClick={handleAddLead}>
                <KanbanSquare className="mr-2 h-4 w-4" /> Converter em Lead no CRM
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <StickyNote className="mr-2 h-4 w-4" /> Adicionar Anotação Rápida
              </Button>
              <Button
                className="w-full justify-start text-destructive hover:text-destructive"
                variant="outline"
              >
                Block & Report Spam
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Message Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        ref={scrollRef}
        style={{ backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')" }}
      >
        {thread.messages.map((msg) => {
          const isMe = msg.sender === 'me'
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[75%] rounded-lg p-3 shadow-sm ${
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 rounded-tl-none border'
                }`}
              >
                <p className="text-sm break-words">{msg.text}</p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 mx-1">{msg.timestamp}</span>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground flex-shrink-0"
          >
            <Smile className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            className="flex-1 bg-muted/50 border-none h-10 rounded-full px-4"
            placeholder="Digite uma mensagem..."
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full flex-shrink-0 h-10 w-10 bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            <Send className="h-4 w-4 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  )
}
// Required dummy import for the generic MessageSquare icon used in empty state
import { MessageSquare } from 'lucide-react'
