import { createContext, useContext, useState, ReactNode, createElement } from 'react'

export interface Device {
  id: string
  name: string
  model: string
  battery: number
  signal: number
  status: 'online' | 'offline' | 'syncing'
  unreadCount: number
}

export interface Message {
  id: string
  text: string
  sender: 'me' | 'them'
  timestamp: string
}

export interface ChatThread {
  id: string
  deviceId: string
  contactName: string
  contactNumber: string
  avatar?: string
  messages: Message[]
  unread: boolean
}

export interface Lead {
  id: string
  name: string
  status: 'novo' | 'em_progresso' | 'negociacao' | 'ganho' | 'perdido'
  value: number
  deviceId: string
  lastNote: string
}

export interface Note {
  id: string
  title: string
  content: string
  date: string
  pinned: boolean
}

interface AppContextType {
  devices: Device[]
  threads: ChatThread[]
  leads: Lead[]
  notes: Note[]
  addMessage: (threadId: string, text: string) => void
  addNote: (note: Omit<Note, 'id' | 'date'>) => void
  addLead: (lead: Omit<Lead, 'id'>) => void
  updateLeadStatus: (leadId: string, status: Lead['status']) => void
  syncDevice: (name: string) => void
  markThreadRead: (threadId: string) => void
}

const AppContext = createContext<AppContextType | null>(null)

const initialDevices: Device[] = [
  {
    id: 'd1',
    name: 'Suporte Vendas',
    model: 'Galaxy S22',
    battery: 85,
    signal: 4,
    status: 'online',
    unreadCount: 2,
  },
  {
    id: 'd2',
    name: 'Atendimento S21',
    model: 'Galaxy S21',
    battery: 20,
    signal: 2,
    status: 'offline',
    unreadCount: 0,
  },
  {
    id: 'd3',
    name: 'Gerência iPhone',
    model: 'iPhone 13',
    battery: 100,
    signal: 5,
    status: 'online',
    unreadCount: 1,
  },
]

const initialThreads: ChatThread[] = [
  {
    id: 't1',
    deviceId: 'd1',
    contactName: 'Carlos Silva',
    contactNumber: '+55 11 99999-1111',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=1',
    unread: true,
    messages: [
      {
        id: 'm1',
        text: 'Olá, gostaria de saber mais sobre o produto.',
        sender: 'them',
        timestamp: '10:30',
      },
      { id: 'm2', text: 'Claro! Qual a sua principal dúvida?', sender: 'me', timestamp: '10:32' },
      {
        id: 'm3',
        text: 'Sobre a integração com outros sistemas.',
        sender: 'them',
        timestamp: '10:35',
      },
    ],
  },
  {
    id: 't2',
    deviceId: 'd1',
    contactName: 'Ana Souza',
    contactNumber: '+55 11 98888-2222',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=2&gender=female',
    unread: false,
    messages: [{ id: 'm4', text: 'Obrigada pelo retorno.', sender: 'them', timestamp: 'Ontem' }],
  },
  {
    id: 't3',
    deviceId: 'd3',
    contactName: 'Diretoria - João',
    contactNumber: '+55 11 97777-3333',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?seed=3',
    unread: true,
    messages: [
      {
        id: 'm5',
        text: 'Por favor, envie o relatório atualizado.',
        sender: 'them',
        timestamp: '09:00',
      },
    ],
  },
]

const initialLeads: Lead[] = [
  {
    id: 'l1',
    name: 'Carlos Silva',
    status: 'novo',
    value: 5000,
    deviceId: 'd1',
    lastNote: 'Interesse em integração.',
  },
  {
    id: 'l2',
    name: 'Empresa X',
    status: 'em_progresso',
    value: 12000,
    deviceId: 'd1',
    lastNote: 'Aguardando aprovação de orçamento.',
  },
  {
    id: 'l3',
    name: 'Tech Solutions',
    status: 'negociacao',
    value: 8500,
    deviceId: 'd3',
    lastNote: 'Reunião agendada para sexta.',
  },
  {
    id: 'l4',
    name: 'Ana Souza',
    status: 'ganho',
    value: 3000,
    deviceId: 'd1',
    lastNote: 'Contrato assinado.',
  },
]

const initialNotes: Note[] = [
  {
    id: 'n1',
    title: 'Reunião de Alinhamento',
    content: 'Discutir novas metas para o próximo trimestre com a equipe de vendas.',
    date: '20 Mai, 14:00',
    pinned: true,
  },
  {
    id: 'n2',
    title: 'Feedback Cliente Alpha',
    content: 'Eles gostaram da nova interface, mas pediram mais relatórios.',
    date: '19 Mai, 10:15',
    pinned: false,
  },
]

export function AppProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<Device[]>(initialDevices)
  const [threads, setThreads] = useState<ChatThread[]>(initialThreads)
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [notes, setNotes] = useState<Note[]>(initialNotes)

  const addMessage = (threadId: string, text: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          return {
            ...t,
            messages: [
              ...t.messages,
              {
                id: Math.random().toString(),
                text,
                sender: 'me',
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ],
          }
        }
        return t
      }),
    )
  }

  const markThreadRead = (threadId: string) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, unread: false } : t)))
  }

  const addNote = (note: Omit<Note, 'id' | 'date'>) => {
    setNotes((prev) => [
      {
        ...note,
        id: Math.random().toString(),
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      },
      ...prev,
    ])
  }

  const addLead = (lead: Omit<Lead, 'id'>) => {
    setLeads((prev) => [{ ...lead, id: Math.random().toString() }, ...prev])
  }

  const updateLeadStatus = (leadId: string, status: Lead['status']) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)))
  }

  const syncDevice = (name: string) => {
    setDevices((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        name,
        model: 'Unknown Device',
        battery: 100,
        signal: 5,
        status: 'online',
        unreadCount: 0,
      },
    ])
  }

  return createElement(
    AppContext.Provider,
    {
      value: {
        devices,
        threads,
        leads,
        notes,
        addMessage,
        addNote,
        addLead,
        updateLeadStatus,
        syncDevice,
        markThreadRead,
      },
    },
    children,
  )
}

export default function useAppStore() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppStore must be used within AppProvider')
  return context
}
