import React, { useState, useEffect, useRef, Fragment } from 'react'
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
  User,
  Zap,
  Tags,
  Check,
  CalendarClock,
  X,
  File as FileIcon,
  Download,
  Image as ImageIcon,
  Pencil,
  Wand2,
  Sparkles,
  Loader2,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createScheduledMessage } from '@/services/scheduled_messages'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SmartAvatar } from '@/components/chat/SmartAvatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { getTriggers } from '@/services/message_triggers'
import { getLabels } from '@/services/labels'
import { getContactTags, toggleContactTag } from '@/services/contact_tags'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { sendMessage } from '@/services/messages'
import { updateContactByJid } from '@/services/contacts'
import pb from '@/lib/pocketbase/client'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

const formatInline = (text: string, isMe: boolean): React.ReactNode => {
  const regex = /(https?:\/\/[^\s]+|`[^`]+`|\*[^*]+\*|_[^_]+_|~[^~]+~)/g
  const parts = text.split(regex)

  return parts.map((part, i) => {
    if (!part) return null

    if (part.match(/^https?:\/\/[^\s]+$/)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`hover:underline break-all font-medium transition-colors ${
            isMe
              ? 'text-primary-foreground/90 hover:text-primary-foreground'
              : 'text-secondary-foreground/90 hover:text-secondary-foreground'
          }`}
        >
          {part}
        </a>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="bg-black/30 px-1.5 py-0.5 rounded text-[13px] font-mono text-white/90"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <strong key={i} className="font-bold">
          {formatInline(part.slice(1, -1), isMe)}
        </strong>
      )
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return (
        <em key={i} className="italic">
          {formatInline(part.slice(1, -1), isMe)}
        </em>
      )
    }
    if (part.startsWith('~') && part.endsWith('~')) {
      return (
        <del key={i} className="line-through">
          {formatInline(part.slice(1, -1), isMe)}
        </del>
      )
    }

    return <Fragment key={i}>{part}</Fragment>
  })
}

const renderMessage = (content: string, isMe: boolean) => {
  if (!content) return null
  const parts = content.split(/(```[\s\S]*?```)/g)

  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      return (
        <pre
          key={i}
          className="bg-black/30 p-3 rounded-md my-2 text-[13px] overflow-x-auto font-mono text-white/90 border border-white/10 whitespace-pre-wrap"
        >
          <code>{part.slice(3, -3)}</code>
        </pre>
      )
    }

    const lines = part.split('\n')
    const result: React.ReactNode[] = []
    let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ul') {
          result.push(
            <ul
              key={`ul-${result.length}`}
              className="list-disc pl-5 my-2 space-y-1 marker:text-white/50"
            >
              {currentList.items.map((item, idx) => (
                <li key={idx}>{formatInline(item, isMe)}</li>
              ))}
            </ul>,
          )
        } else {
          result.push(
            <ol
              key={`ol-${result.length}`}
              className="list-decimal pl-5 my-2 space-y-1 marker:text-white/50"
            >
              {currentList.items.map((item, idx) => (
                <li key={idx}>{formatInline(item, isMe)}</li>
              ))}
            </ol>,
          )
        }
        currentList = null
      }
    }

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j]
      const isUl = line.match(/^[-*]\s+(.*)$/)
      const isOl = line.match(/^\d+\.\s+(.*)$/)
      const isQuote = line.match(/^>\s+(.*)$/)

      if (isUl) {
        if (currentList && currentList.type !== 'ul') flushList()
        if (!currentList) currentList = { type: 'ul', items: [] }
        currentList.items.push(isUl[1])
      } else if (isOl) {
        if (currentList && currentList.type !== 'ol') flushList()
        if (!currentList) currentList = { type: 'ol', items: [] }
        currentList.items.push(isOl[1])
      } else {
        flushList()
        if (isQuote) {
          result.push(
            <blockquote
              key={`quote-${j}`}
              className={`border-l-4 pl-3 py-1 my-2 italic rounded-r ${
                isMe
                  ? 'border-primary-foreground/40 bg-primary-foreground/10 text-primary-foreground'
                  : 'border-secondary-foreground/40 bg-secondary-foreground/10 text-secondary-foreground'
              }`}
            >
              {formatInline(isQuote[1], isMe)}
            </blockquote>,
          )
        } else {
          const nextLine = lines[j + 1]
          const isNextBlock =
            nextLine !== undefined &&
            (nextLine.match(/^[-*]\s+/) || nextLine.match(/^\d+\.\s+/) || nextLine.match(/^>\s+/))

          result.push(
            <Fragment key={`line-${j}`}>
              {formatInline(line, isMe)}
              {j < lines.length - 1 && !isNextBlock && <br />}
            </Fragment>,
          )
        }
      }
    }
    flushList()

    return <Fragment key={i}>{result}</Fragment>
  })
}

export function ChatWindow({ device, contact, conversation, contacts, onBack, isMobile }: any) {
  const { user } = useAuth()
  const { addTask } = useAppStore()
  const { toast } = useToast()

  const [msgText, setMsgText] = useState('')
  const [isNicknameOpen, setIsNicknameOpen] = useState(false)
  const [nicknameInput, setNicknameInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const [triggers, setTriggers] = useState<any[]>([])
  const [searchTrigger, setSearchTrigger] = useState('')
  const [isTriggerOpen, setIsTriggerOpen] = useState(false)

  const [labels, setLabels] = useState<any[]>([])
  const [contactTags, setContactTags] = useState<any[]>([])
  const [isLabelsOpen, setIsLabelsOpen] = useState(false)

  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiActionSelected, setAiActionSelected] = useState('')
  const [aiOriginalText, setAiOriginalText] = useState('')
  const [aiPrompts, setAiPrompts] = useState<any[]>([])
  const [isAiPromptsLoading, setIsAiPromptsLoading] = useState(true)

  const messages = conversation?.messages || []

  useEffect(() => {
    getTriggers()
      .then(setTriggers)
      .catch(() => {})
    getLabels()
      .then(setLabels)
      .catch(() => {})
  }, [])

  const loadContactTags = async () => {
    if (device && contact) {
      try {
        const tags = await getContactTags(device.id)
        setContactTags(tags.filter((t: any) => t.remote_sender === contact))
      } catch {
        /* intentionally ignored */
      }
    }
  }

  useEffect(() => {
    loadContactTags()
  }, [device?.id, contact])

  useRealtime('message_triggers', () => {
    getTriggers()
      .then(setTriggers)
      .catch(() => {})
  })
  useRealtime('labels', () => {
    getLabels()
      .then(setLabels)
      .catch(() => {})
  })
  useRealtime('contact_tags', () => {
    loadContactTags()
  })

  const fetchAiPrompts = () => {
    if (!user) return
    setIsAiPromptsLoading(true)
    pb.collection('ai_assistant_prompts')
      .getFullList({ filter: 'is_active = true', sort: 'created' })
      .then(setAiPrompts)
      .catch(() => {})
      .finally(() => setIsAiPromptsLoading(false))
  }

  useEffect(() => {
    fetchAiPrompts()
  }, [user])

  useRealtime('ai_assistant_prompts', () => {
    fetchAiPrompts()
  })

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  useEffect(() => {
    if (conversation && conversation.unread_count > 0 && device) {
      const unreadMsgs = messages.filter((m: any) => !m.is_read && m.direction === 'inbound')
      unreadMsgs.forEach((m: any) => {
        pb.collection('messages')
          .update(m.id, { is_read: true })
          .catch(() => {})
      })
    }
  }, [contact, conversation?.unread_count, device])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!msgText.trim() && attachments.length === 0) || !device || !user || !contact) return

    const content = msgText.trim() ? msgText.trim() : '[Anexo]'

    try {
      await sendMessage({
        content,
        device_id: device.id,
        sender_id: user.id,
        is_read: true,
        remote_sender: contact,
        attachments: attachments.length > 0 ? attachments : undefined,
      })
      setMsgText('')
      setAttachments([])
    } catch (err) {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' })
    }
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (
      (!msgText.trim() && attachments.length === 0) ||
      !device ||
      !user ||
      !contact ||
      !scheduleDate
    )
      return

    const content = msgText.trim() ? msgText.trim() : '[Anexo]'

    try {
      await createScheduledMessage({
        content,
        scheduled_at: new Date(scheduleDate).toISOString(),
        status: 'pending',
        device_id: device.id,
        remote_sender: contact,
        user_id: user.id,
        attachments: attachments.length > 0 ? attachments : undefined,
      })
      toast({ title: 'Mensagem agendada com sucesso' })
      setMsgText('')
      setAttachments([])
      setIsScheduleOpen(false)
      setScheduleDate('')
    } catch (err) {
      toast({ title: 'Erro ao agendar mensagem', variant: 'destructive' })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (attachments.length + newFiles.length > 10) {
        toast({ title: 'Máximo de 10 arquivos permitidos', variant: 'destructive' })
        return
      }

      const validFiles = newFiles.filter((f) => {
        if (f.size > 10485760) {
          toast({ title: `Arquivo ${f.name} excede o limite de 10MB`, variant: 'destructive' })
          return false
        }
        return true
      })

      setAttachments((prev) => [...prev, ...validFiles])
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleAiAction = async (action: string, overrideText?: string) => {
    const textToUse = overrideText !== undefined ? overrideText : msgText.trim()

    if (!textToUse && action !== 'suggest_reply') {
      toast({ title: 'Por favor, digite uma mensagem primeiro.', variant: 'destructive' })
      return
    }

    setAiActionSelected(action)
    if (overrideText === undefined) {
      setAiOriginalText(textToUse)
    }

    setIsAiLoading(true)
    try {
      const context = messages.slice(-10).map((m: any) => ({
        role: m.direction === 'outbound' || m.sender_id === user?.id ? 'assistant' : 'user',
        text: m.content,
      }))

      const res = await pb.send('/backend/v1/ai/message-assist', {
        method: 'POST',
        body: JSON.stringify({
          action,
          text: textToUse,
          conversationContext: context,
        }),
      })

      setAiResult(res.result)
      setAiModalOpen(true)
    } catch (err) {
      toast({
        title: 'Não foi possível melhorar o texto agora. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  const handleAddTask = () => {
    if (!device || !contact) return
    const contactName = displayName
    addTask({
      title: `Acompanhamento: ${contactName}`,
      status: 'pendente',
      deviceId: device.id,
      description: `Tarefa criada via ChatHub para o contato ${contactName}.`,
    })
    toast({ title: 'Tarefa Criada' })
  }

  const handleSelectTrigger = (content: string) => {
    setMsgText((prev) => (prev ? prev + '\n\n' + content : content))
    setIsTriggerOpen(false)
    setSearchTrigger('')
  }

  const handleToggleLabel = async (labelId: string) => {
    if (!device || !contact) return
    try {
      await toggleContactTag(device.id, contact, labelId)
    } catch (err) {
      toast({ title: 'Erro ao alterar etiqueta', variant: 'destructive' })
    }
  }

  const contactRecord = contacts?.find((c: any) => c.remote_jid === contact)

  const displayName = contactRecord?.nickname
    ? contactRecord.nickname
    : conversation?.sender_name && conversation.sender_name !== 'Unknown Sender'
      ? conversation.sender_name
      : contactRecord?.name && contactRecord.name !== 'Unknown Sender'
        ? contactRecord.name
        : contact === 'Unknown Sender'
          ? contact
          : `+${contact}`

  const handleEditNickname = () => {
    setNicknameInput(contactRecord?.nickname || '')
    setIsNicknameOpen(true)
  }

  const handleSaveNickname = async () => {
    try {
      await updateContactByJid(contact, { nickname: nicknameInput })
      setIsNicknameOpen(false)
      toast({ title: 'Apelido salvo com sucesso' })
    } catch (err) {
      toast({ title: 'Erro ao salvar apelido', variant: 'destructive' })
    }
  }

  const filteredTriggers = triggers.filter((t) =>
    t.title.toLowerCase().includes(searchTrigger.toLowerCase()),
  )

  if (!device || !contact) {
    return (
      <div className="hidden md:flex flex-col items-center justify-center h-full bg-zinc-950/30 backdrop-blur-sm flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="max-w-md text-center p-8 rounded-3xl bg-black/20 border border-white/5 shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-2xl relative z-10">
          <div className="h-24 w-24 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
            <MessageSquare className="h-10 w-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">CentralCell Web</h2>
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
            {device
              ? 'Selecione uma conversa para começar a enviar mensagens.'
              : 'Selecione uma instância e uma conversa para começar.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-transparent flex-1 relative min-w-0">
      <div className="h-[72px] border-b border-white/5 bg-zinc-950/40 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-between px-6 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="-ml-2 mr-1 text-foreground/80 hover:text-foreground flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <SmartAvatar
            jid={contact}
            name={displayName}
            instanceKey={device?.instance_key}
            contactRecord={contactRecord}
            className="h-11 w-11 border border-white/10 shadow-lg flex-shrink-0 transition-transform duration-300 hover:scale-105"
            fallbackClassName="bg-black/40 text-foreground"
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-[16px] text-foreground tracking-tight truncate flex items-center gap-2">
              {displayName}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditNickname}
                className="h-6 w-6 ml-1 opacity-50 hover:opacity-100 flex-shrink-0"
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </h3>
            <div className="flex items-center gap-2 mt-0.5 truncate">
              <span className="text-xs text-muted-foreground font-medium truncate">
                Via {device.name}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Popover open={isLabelsOpen} onOpenChange={setIsLabelsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground/80 hover:text-foreground hover:bg-white/10 rounded-full flex-shrink-0 relative transition-all duration-300 hover:scale-105"
              >
                <Tags className="h-5 w-5" />
                {contactTags.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full border border-zinc-950" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-56 p-2 bg-zinc-950/95 border-white/10 backdrop-blur-xl"
            >
              <div className="mb-2 px-2 pb-2 pt-1 border-b border-white/10 text-xs font-semibold text-muted-foreground">
                Etiquetas do Contato
              </div>
              {labels.length === 0 ? (
                <div className="text-xs text-center text-muted-foreground p-2">
                  Nenhuma etiqueta cadastrada.
                </div>
              ) : (
                <div className="space-y-1">
                  {labels.map((label) => {
                    const isSelected = contactTags.some((t: any) => t.label_id === label.id)
                    return (
                      <button
                        key={label.id}
                        onClick={() => handleToggleLabel(label.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-white/10 transition-colors"
                      >
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="flex-1 text-left truncate">{label.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-white" />}
                      </button>
                    )
                  })}
                </div>
              )}
            </PopoverContent>
          </Popover>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-foreground/80 hover:text-foreground hover:bg-white/10 flex-shrink-0 ml-1 transition-all duration-300 hover:scale-105"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-zinc-950/95 border-white/10 backdrop-blur-xl">
              <SheetHeader>
                <SheetTitle className="text-foreground">Info do Contato</SheetTitle>
              </SheetHeader>
              <div className="py-8 flex flex-col items-center border-b border-white/10">
                <SmartAvatar
                  jid={contact}
                  name={displayName}
                  instanceKey={device?.instance_key}
                  contactRecord={contactRecord}
                  className="h-32 w-32 mb-5 border border-white/10 shadow-2xl text-4xl"
                  fallbackClassName="text-3xl bg-black/40 text-foreground"
                />
                <h3 className="font-bold text-xl text-foreground tracking-tight text-center">
                  {displayName}
                </h3>
                {displayName !== `+${contact}` && contact !== 'Unknown Sender' && (
                  <p className="text-muted-foreground mt-1 text-sm">+{contact}</p>
                )}
                <p className="text-muted-foreground mt-1 text-sm">Via {device.name}</p>

                {contactTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-4 justify-center">
                    {contactTags.map(
                      (tag) =>
                        tag.expand?.label_id && (
                          <div
                            key={tag.id}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs"
                          >
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tag.expand.label_id.color }}
                            />
                            {tag.expand.label_id.name}
                          </div>
                        ),
                    )}
                  </div>
                )}
              </div>
              <div className="py-6 space-y-3">
                <Button
                  className="w-full justify-start h-12 bg-white/5 hover:bg-white/10 border-white/5 text-foreground transition-all"
                  variant="outline"
                  onClick={handleAddTask}
                >
                  <ListTodo className="mr-3 h-5 w-5 text-blue-400" /> Criar Tarefa para Contato
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
      </div>

      <div
        className="flex-1 overflow-y-auto p-6 space-y-5 bg-black/5 backdrop-blur-sm custom-scrollbar relative"
        ref={scrollRef}
      >
        {messages.map((msg: any) => {
          const isMe = msg.direction === 'outbound' || msg.sender_id === user?.id
          const timestamp = new Date(msg.created).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
          return (
            <div
              key={msg.id}
              className={`flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`flex gap-2.5 items-end w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <SmartAvatar
                    jid={msg.remote_sender}
                    name={(() => {
                      const msgContactRecord = contacts?.find(
                        (c: any) => c.remote_jid === msg.remote_sender,
                      )
                      return msgContactRecord?.nickname || msg.sender_name || msgContactRecord?.name
                    })()}
                    instanceKey={device?.instance_key}
                    contactRecord={contacts?.find((c: any) => c.remote_jid === msg.remote_sender)}
                    className="h-7 w-7 border border-white/10 shadow-sm flex-shrink-0 mb-1 hidden sm:block"
                    fallbackClassName="bg-black/20 text-xs"
                  />
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md relative group transition-all duration-300 ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-sm shadow-blue-900/20'
                      : 'bg-secondary text-secondary-foreground rounded-bl-sm shadow-black/40'
                  }`}
                >
                  <div className="text-xs font-bold mb-1.5 opacity-90 flex items-center justify-between">
                    {isMe ? (
                      <span className="text-primary-foreground/80">{user?.name || 'Você'}</span>
                    ) : (
                      <span className="text-secondary-foreground/80">
                        {(() => {
                          const msgContactRecord = contacts?.find(
                            (c: any) => c.remote_jid === msg.remote_sender,
                          )
                          return msgContactRecord?.nickname
                            ? msgContactRecord.nickname
                            : msg.sender_name && msg.sender_name !== 'Unknown Sender'
                              ? msg.sender_name
                              : msgContactRecord?.name && msgContactRecord.name !== 'Unknown Sender'
                                ? msgContactRecord.name
                                : msg.remote_sender === 'Unknown Sender'
                                  ? msg.remote_sender
                                  : `+${msg.remote_sender}`
                        })()}
                      </span>
                    )}
                  </div>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {msg.attachments.map((filename: string, idx: number) => {
                        const url = `${import.meta.env.VITE_POCKETBASE_URL}/api/files/${msg.collectionId}/${msg.id}/${filename}`
                        const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(filename)
                        if (isImage) {
                          return (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block max-w-[240px] overflow-hidden rounded-xl border border-white/10 hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-sm"
                            >
                              <img
                                src={url}
                                alt={filename}
                                className="w-full h-auto object-cover"
                              />
                            </a>
                          )
                        }
                        return (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 p-2.5 rounded-md hover:opacity-80 transition-colors text-sm border ${isMe ? 'border-primary-foreground/20 bg-primary-foreground/10' : 'border-secondary-foreground/20 bg-secondary-foreground/10'}`}
                          >
                            <FileIcon
                              className={`h-4 w-4 flex-shrink-0 ${isMe ? 'text-primary-foreground' : 'text-secondary-foreground'}`}
                            />
                            <span className="truncate max-w-[150px]" title={filename}>
                              {filename}
                            </span>
                            <Download className="h-4 w-4 flex-shrink-0 ml-auto opacity-50" />
                          </a>
                        )
                      })}
                    </div>
                  )}
                  {msg.content !== '[Anexo]' && (
                    <div className="text-[15px] leading-relaxed break-words">
                      {renderMessage(msg.content, isMe)}
                    </div>
                  )}
                  <div
                    className={`text-[10px] mt-1.5 font-medium flex items-center justify-end ${
                      isMe ? 'text-primary-foreground/70' : 'text-secondary-foreground/70'
                    }`}
                  >
                    {timestamp}
                  </div>
                </div>
                {isMe && (
                  <SmartAvatar
                    jid="me"
                    name={user?.name || 'Você'}
                    isInstance={true}
                    deviceRecord={device}
                    className="h-7 w-7 border border-white/10 shadow-sm flex-shrink-0 mb-1 hidden sm:block"
                    fallbackClassName="bg-black/20 text-xs"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col bg-zinc-950/60 backdrop-blur-2xl border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] flex-shrink-0 p-4 z-10 relative">
        {(device?.signature || user?.signature) && (
          <div className="px-2 pb-3 text-[12px] text-muted-foreground flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-purple-400" />
              <span>
                Assinatura automática:{' '}
                <span className="font-semibold text-foreground/80 italic">
                  {device?.signature || user?.signature}
                </span>
              </span>
            </div>
          </div>
        )}
        <form onSubmit={handleSend} className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 py-2 bg-black/30 border border-white/5 rounded-xl">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white/10 rounded-md px-2.5 py-1.5 text-xs text-white"
                >
                  {file.type.startsWith('image/') ? (
                    <ImageIcon className="h-3 w-3 opacity-70" />
                  ) : (
                    <FileIcon className="h-3 w-3 opacity-70" />
                  )}
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-muted-foreground hover:text-red-400 ml-1 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-3 w-full">
            <Popover open={isTriggerOpen} onOpenChange={setIsTriggerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-blue-400 hover:bg-white/5 h-[48px] w-[48px] rounded-full flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <Zap className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 p-0 mb-2 border-white/10 bg-zinc-950/95 backdrop-blur-xl"
                align="start"
                side="top"
                sideOffset={10}
              >
                <div className="p-3 border-b border-white/10">
                  <h4 className="font-medium text-sm mb-2 text-foreground/90">Gatilhos Rápidos</h4>
                  <input
                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    placeholder="Buscar gatilho..."
                    value={searchTrigger}
                    onChange={(e) => setSearchTrigger(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto p-2">
                  {filteredTriggers.length === 0 ? (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      Nenhum gatilho encontrado.
                    </div>
                  ) : (
                    filteredTriggers.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className="w-full text-left p-2 rounded-md hover:bg-white/10 transition-colors group mb-1 last:mb-0"
                        onClick={() => handleSelectTrigger(t.content)}
                      >
                        <div className="font-medium text-sm text-foreground/90 group-hover:text-blue-400 transition-colors truncate">
                          {t.title}
                        </div>
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {t.content}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground hover:bg-white/5 h-[48px] w-[48px] rounded-full flex-shrink-0 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 bg-black/40 border border-white/10 hover:border-white/20 rounded-2xl flex items-end focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all duration-300 overflow-hidden shadow-inner group">
              <textarea
                className="flex-1 bg-transparent border-none min-h-[48px] max-h-[120px] px-4 py-3 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none resize-none leading-relaxed custom-scrollbar pt-3.5"
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={isAiLoading}
                    className="text-muted-foreground hover:text-blue-400 hover:bg-transparent h-[48px] w-[48px] flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    {isAiLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                    ) : (
                      <Wand2 className="h-5 w-5" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-zinc-950 border-white/10 backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold">
                    Assistente IA
                  </DropdownMenuLabel>
                  {isAiPromptsLoading ? (
                    <div className="p-4 flex justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : aiPrompts.length === 0 ? (
                    <div className="p-2 text-xs text-muted-foreground text-center">
                      Nenhuma ação ativa
                    </div>
                  ) : (
                    aiPrompts.map((p, idx) => (
                      <React.Fragment key={p.id}>
                        {p.action_key === 'formalize' && idx > 0 && (
                          <DropdownMenuSeparator className="bg-white/10" />
                        )}
                        <DropdownMenuItem
                          onClick={() => handleAiAction(p.action_key)}
                          className="cursor-pointer focus:bg-white/10"
                        >
                          {p.label}
                        </DropdownMenuItem>
                      </React.Fragment>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground hover:bg-transparent h-[48px] w-[48px] flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <Dialog open={isNicknameOpen} onOpenChange={setIsNicknameOpen}>
              <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10">
                <DialogHeader>
                  <DialogTitle>Editar Apelido do Contato</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="nickname">Apelido (visível apenas para você)</Label>
                    <Input
                      id="nickname"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="Ex: Cliente VIP, Fornecedor..."
                      className="bg-black/40 border-white/10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleSaveNickname()
                        }
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsNicknameOpen(false)}
                    className="bg-transparent border-white/10 hover:bg-white/5"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveNickname}>Salvar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={!msgText.trim() && attachments.length === 0}
                  className="rounded-full flex-shrink-0 h-[48px] w-[48px] bg-white/5 hover:bg-white/10 text-foreground transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <CalendarClock className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10">
                <DialogHeader>
                  <DialogTitle>Agendar Mensagem</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Data e Hora</Label>
                    <input
                      id="date"
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Mensagem</Label>
                    <div className="rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-muted-foreground min-h-[60px] max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                      {msgText ||
                        (attachments.length > 0
                          ? '[Apenas Anexos]'
                          : 'Nenhuma mensagem digitada...')}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Anexos</Label>
                    {attachments.length > 0 ? (
                      <div className="text-sm text-muted-foreground mb-2">
                        {attachments.length} arquivo(s) selecionado(s)
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground mb-2">Nenhum anexo.</div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-transparent border-white/10 hover:bg-white/5"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Adicionar Anexo
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsScheduleOpen(false)}
                    className="bg-transparent border-white/10 hover:bg-white/5"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    disabled={!scheduleDate || (!msgText.trim() && attachments.length === 0)}
                  >
                    Confirmar Agendamento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              type="submit"
              size="icon"
              disabled={!msgText.trim() && attachments.length === 0}
              className="rounded-full flex-shrink-0 h-[48px] w-[48px] bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
            >
              <Send className="h-5 w-5 ml-0.5" />
            </Button>
          </div>

          <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
            <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-white/10">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-400" /> Sugestão da IA
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <div className="p-4 bg-black/40 border border-white/10 rounded-xl text-sm leading-relaxed text-foreground min-h-[100px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                  {aiResult}
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAiModalOpen(false)}
                  className="bg-transparent border-white/10 hover:bg-white/5 sm:mr-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleAiAction(aiActionSelected, aiOriginalText)}
                  disabled={isAiLoading}
                  className="bg-white/10 hover:bg-white/20 text-foreground"
                >
                  {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Tentar novamente
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setMsgText(aiResult)
                    setAiModalOpen(false)
                  }}
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Usar mensagem
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </form>
      </div>
    </div>
  )
}
