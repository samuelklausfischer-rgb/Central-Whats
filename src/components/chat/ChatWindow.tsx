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
      <div className="hidden md:flex flex-col items-center justify-center h-full bg-background/10 backdrop-blur-sm flex-1">
        <div className="max-w-md text-center p-8 rounded-3xl bg-black/20 border border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="h-24 w-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <MessageSquare className="h-10 w-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">CentralCell Web</h2>
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
            Select a device to start chatting. Manage communications efficiently in a professional
            environment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent flex-1 relative">
      {/* Header */}
      <div className="h-[72px] border-b border-white/10 bg-black/20 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="-ml-2 mr-1 text-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="relative">
            <Avatar className="h-11 w-11 border border-white/10 shadow-sm">
              <AvatarFallback className="bg-black/40 text-foreground">
                {device.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${device.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'}`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-[16px] text-foreground tracking-tight">
              {device.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground font-medium">{device.department}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span
                className={`text-[11px] font-medium tracking-wide ${device.status === 'online' ? 'text-emerald-400' : 'text-zinc-400'}`}
              >
                {device.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-zinc-950/95 border-white/10 backdrop-blur-xl">
            <SheetHeader>
              <SheetTitle className="text-foreground">Info do Dispositivo</SheetTitle>
            </SheetHeader>
            <div className="py-8 flex flex-col items-center border-b border-white/10">
              <Avatar className="h-32 w-32 mb-5 border border-white/10 shadow-2xl">
                <AvatarFallback className="text-3xl bg-black/40 text-foreground">
                  {device.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl text-foreground tracking-tight">{device.name}</h3>
              <p className="text-muted-foreground mt-1">{device.department}</p>
              <div
                className={`mt-4 px-4 py-1.5 rounded-full text-[13px] font-medium border ${device.status === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'}`}
              >
                {device.status === 'online' ? 'Status: Online' : 'Status: Offline'}
              </div>
            </div>
            <div className="py-6 space-y-3">
              <Button
                className="w-full justify-start h-12 bg-white/5 hover:bg-white/10 border-white/5 text-foreground transition-all"
                variant="outline"
                onClick={handleAddTask}
              >
                <ListTodo className="mr-3 h-5 w-5 text-blue-400" /> Criar Tarefa
              </Button>
              <Button
                className="w-full justify-start h-12 bg-white/5 hover:bg-white/10 border-white/5 text-foreground transition-all"
                variant="outline"
              >
                <StickyNote className="mr-3 h-5 w-5 text-purple-400" /> Adicionar Anotação
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-5 bg-black/10 backdrop-blur-sm"
        ref={scrollRef}
      >
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id
          const timestamp = new Date(msg.created).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm relative group ${isMe ? 'bg-blue-600/80 text-white rounded-br-sm border border-blue-500/30' : 'bg-white/10 text-foreground rounded-bl-sm border border-white/5 backdrop-blur-md'}`}
              >
                <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                  {msg.content}
                </p>
                <div
                  className={`text-[10px] mt-1.5 font-medium flex items-center justify-end ${isMe ? 'text-blue-100/70' : 'text-muted-foreground'}`}
                >
                  {timestamp}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="flex flex-col bg-black/20 backdrop-blur-xl border-t border-white/10 flex-shrink-0 p-4">
        {user?.signature && (
          <div className="px-2 pb-3 text-[13px] text-muted-foreground flex items-center gap-1.5">
            <Info className="h-4 w-4 text-blue-400" />
            <span>
              Assinatura ativa:{' '}
              <span className="font-semibold text-foreground/80 italic">*{user.signature}*</span>
            </span>
          </div>
        )}
        <form onSubmit={handleSend} className="flex items-end gap-3 max-w-4xl mx-auto w-full">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-white/5 h-[48px] w-[48px] rounded-full flex-shrink-0 transition-colors"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl flex items-end focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all overflow-hidden shadow-inner">
            <textarea
              className="flex-1 bg-transparent border-none min-h-[48px] max-h-[120px] px-4 py-3.5 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none resize-none leading-relaxed"
              placeholder="Digite uma mensagem..."
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
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-transparent h-[48px] w-[48px] flex-shrink-0 transition-colors"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!msgText.trim()}
            className="rounded-full flex-shrink-0 h-[48px] w-[48px] bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:shadow-none"
          >
            <Send className="h-5 w-5 ml-0.5" />
          </Button>
        </form>
      </div>
    </div>
  )
}
