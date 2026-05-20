import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  StickyNote,
  ListTodo,
  MessageSquare,
} from 'lucide-react'
import { ChatThread } from '@/stores/useAppStore'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

interface Props {
  thread: ChatThread | null
  onBack: () => void
  isMobile: boolean
}

export function ChatWindow({ thread, onBack, isMobile }: Props) {
  const [msgText, setMsgText] = useState('')
  const { addMessage, addTask, markThreadRead } = useAppStore()
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

  const handleAddTask = () => {
    if (!thread) return
    addTask({
      title: `Acompanhamento: ${thread.contactName}`,
      status: 'pendente',
      deviceId: thread.deviceId,
      description: 'Tarefa criada automaticamente via Chat da Central.',
    })
    toast({
      title: 'Tarefa Criada',
      description: `Tarefa para ${thread.contactName} adicionada no CRM Interno.`,
    })
  }

  if (!thread) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full bg-[#f0f2f5] dark:bg-slate-900 flex-1">
        <div className="max-w-md text-center">
          <div className="h-32 w-32 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <MessageSquare className="h-12 w-12 text-slate-400" />
          </div>
          <h2 className="text-3xl font-light text-slate-700 dark:text-slate-300">
            CentralCell Web
          </h2>
          <p className="text-slate-500 mt-4 text-sm leading-relaxed">
            Selecione uma conversa ao lado para enviar mensagens através do aparelho corporativo
            selecionado. Suas mensagens são sincronizadas com o dispositivo em tempo real.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-slate-950 flex-1 relative border-l">
      {/* Chat Header */}
      <div className="h-[60px] border-b bg-[#f0f2f5] dark:bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={thread.avatar} />
            <AvatarFallback>{thread.contactName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="cursor-pointer">
            <h3 className="font-medium text-[15px] leading-none text-slate-800 dark:text-slate-200">
              {thread.contactName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {thread.contactNumber}
            </p>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Informações do Contato</SheetTitle>
            </SheetHeader>
            <div className="py-6 flex flex-col items-center border-b">
              <Avatar className="h-40 w-40 mb-6 shadow-md">
                <AvatarImage src={thread.avatar} />
                <AvatarFallback className="text-4xl">
                  {thread.contactName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-2xl">{thread.contactName}</h3>
              <p className="text-muted-foreground text-lg">{thread.contactNumber}</p>
            </div>
            <div className="py-6 space-y-4">
              <Button
                className="w-full justify-start h-12 text-base"
                variant="outline"
                onClick={handleAddTask}
              >
                <ListTodo className="mr-3 h-5 w-5" /> Criar Tarefa Interna
              </Button>
              <Button className="w-full justify-start h-12 text-base" variant="outline">
                <StickyNote className="mr-3 h-5 w-5" /> Adicionar Anotação Rápida
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Message Area */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        ref={scrollRef}
        style={{ backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')" }}
      >
        {thread.messages.map((msg) => {
          const isMe = msg.sender === 'me'
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg p-2.5 px-3.5 shadow-sm relative ${
                  isMe
                    ? 'bg-[#d9fdd3] text-slate-800 dark:bg-emerald-900 dark:text-slate-100 rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border-transparent'
                }`}
              >
                <p className="text-[14.5px] leading-relaxed break-words mr-10">{msg.text}</p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 absolute bottom-1 right-2">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input Area */}
      <div className="px-4 py-3 bg-[#f0f2f5] dark:bg-slate-900 border-t">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-600 dark:text-slate-400 flex-shrink-0"
          >
            <Smile className="h-6 w-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-600 dark:text-slate-400 flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            className="flex-1 bg-white dark:bg-slate-800 border-none h-11 rounded-lg px-4 text-[15px] focus-visible:ring-0 shadow-sm"
            placeholder="Digite uma mensagem"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="rounded-full flex-shrink-0 h-11 w-11 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            <Send className="h-6 w-6 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  )
}
