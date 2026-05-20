import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  StickyNote,
  ListTodo,
  MessageSquare,
  Info,
} from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { getMessages, sendMessage } from '@/services/messages'
import pb from '@/lib/pocketbase/client'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

export function ChatWindow({ deviceId, device, onBack, isMobile }: any) {
  const { user } = useAuth()
  const { addTask } = useAppStore()
  const { toast } = useToast()

  const [messages, setMessages] = useState<any[]>([])
  const [msgText, setMsgText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const loadMessages = async () => {
    if (!deviceId) return
    const msgs = await getMessages(deviceId)
    setMessages(msgs)
    if (device?.unread_count > 0) {
      await pb.collection('devices').update(deviceId, { unread_count: 0 })
    }
  }

  useEffect(() => {
    loadMessages()
  }, [deviceId])

  useRealtime('messages', (e) => {
    if (e.record.device_id === deviceId) {
      if (e.action === 'create') setMessages((prev) => [...prev, e.record])
    }
  })

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!msgText.trim() || !deviceId || !user) return

    const signature = user.signature ? `*${user.signature}*\n` : ''
    const content = signature + msgText

    await sendMessage({
      content,
      device_id: deviceId,
      sender_id: user.id,
      is_read: true,
    })
    setMsgText('')
  }

  const handleAddTask = () => {
    if (!device) return
    addTask({
      title: `Acompanhamento: ${device.name}`,
      status: 'pendente',
      deviceId: device.id,
      description: 'Tarefa criada via ChatHub.',
    })
    toast({ title: 'Tarefa Criada' })
  }

  if (!deviceId || !device) {
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
            selecionado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-slate-950 flex-1 relative border-l">
      {/* Header */}
      <div className="h-[60px] border-b bg-[#f0f2f5] dark:bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onBack} className="-ml-2 mr-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarFallback>{device.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-[15px] leading-none text-slate-800 dark:text-slate-200">
              {device.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{device.department}</p>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Info do Dispositivo</SheetTitle>
            </SheetHeader>
            <div className="py-6 flex flex-col items-center border-b">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarFallback className="text-3xl">
                  {device.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl">{device.name}</h3>
              <p className="text-muted-foreground">{device.department}</p>
            </div>
            <div className="py-6 space-y-4">
              <Button
                className="w-full justify-start h-12"
                variant="outline"
                onClick={handleAddTask}
              >
                <ListTodo className="mr-3 h-5 w-5" /> Criar Tarefa
              </Button>
              <Button className="w-full justify-start h-12" variant="outline">
                <StickyNote className="mr-3 h-5 w-5" /> Adicionar Anotação
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        ref={scrollRef}
        style={{ backgroundImage: "url('https://transparenttextures.com/patterns/cubes.png')" }}
      >
        {messages.map((msg) => {
          const isMe = !!msg.sender_id
          const timestamp = new Date(msg.created).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[80%] rounded-lg p-2.5 px-3.5 shadow-sm relative ${isMe ? 'bg-[#d9fdd3] text-slate-800 dark:bg-emerald-900 dark:text-slate-100 rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'}`}
              >
                <p className="text-[14.5px] leading-relaxed break-words mr-10 whitespace-pre-wrap">
                  {msg.content}
                </p>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 absolute bottom-1 right-2">
                  {timestamp}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="flex flex-col bg-[#f0f2f5] dark:bg-slate-900 border-t flex-shrink-0">
        {user?.signature && (
          <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-800/50 border-b flex items-center gap-2">
            <Info className="h-3.5 w-3.5" />
            <span>
              Assinatura ativa: <span className="font-semibold italic">*{user.signature}*</span>
            </span>
          </div>
        )}
        <div className="px-4 py-3">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-500 flex-shrink-0"
            >
              <Smile className="h-6 w-6" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-slate-500 flex-shrink-0"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <textarea
              className="flex-1 bg-white dark:bg-slate-800 border-none min-h-[44px] max-h-[120px] rounded-lg px-4 py-2.5 text-[15px] focus-visible:outline-none shadow-sm resize-none"
              placeholder="Digite uma mensagem"
              value={msgText}
              onChange={(e) => setMsgText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
              rows={1}
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
    </div>
  )
}
