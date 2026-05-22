import { useEffect, useState } from 'react'
import { GripVertical } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  contact_id: string
  expand?: {
    contact_id: {
      name?: string
      nickname?: string
      remote_jid: string
      avatar_url?: string
    }
  }
  created: string
}

export default function CRM() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = async () => {
    try {
      const records = await pb.collection('tasks').getFullList<Task>({
        sort: '-created',
        expand: 'contact_id',
      })
      setTasks(records)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  useRealtime('tasks', () => {
    fetchTasks()
  })

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    try {
      await pb.collection('tasks').update(taskId, { status: newStatus })
    } catch (err) {
      toast({ title: 'Erro ao mover tarefa', variant: 'destructive' })
      fetchTasks()
    }
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.currentTarget.classList.add('opacity-50')
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50')
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return

    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== status) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)))
      updateTaskStatus(taskId, status)
    }
  }

  const columns = [
    {
      id: 'pending',
      title: 'Pendente',
      color: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    },
    {
      id: 'completed',
      title: 'Concluído',
      color: 'bg-green-500/10 border-green-500/20 text-green-500',
    },
  ] as const

  return (
    <div className="flex-1 h-full flex flex-col min-w-0 bg-zinc-950/50 relative overflow-hidden">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Tarefas e Kanban
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Arraste e solte as tarefas para alterar o status.
        </p>
      </div>

      <div className="flex-1 overflow-x-auto p-6 flex gap-6">
        {columns.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              className="flex-shrink-0 w-80 bg-black/20 border border-white/5 rounded-xl flex flex-col overflow-hidden"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div
                className={`px-4 py-3 border-b border-white/5 flex items-center justify-between ${col.color.split(' ')[0]}`}
              >
                <h3 className={`font-semibold text-sm ${col.color.split(' ')[2]}`}>{col.title}</h3>
                <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full text-foreground/70">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                {columnTasks.map((task) => {
                  const contactName =
                    task.expand?.contact_id?.nickname ||
                    task.expand?.contact_id?.name ||
                    `+${task.expand?.contact_id?.remote_jid}`
                  const avatarUrl = task.expand?.contact_id?.avatar_url
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      onDragEnd={handleDragEnd}
                      className="bg-white/5 border border-white/10 p-3 rounded-lg cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium text-sm text-foreground/90 leading-tight">
                          {task.title}
                        </h4>
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 break-words">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5">
                        <div className="flex items-center gap-2 max-w-[70%]">
                          <Avatar className="h-5 w-5 border border-white/10">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="text-[9px] bg-blue-500/20 text-blue-400">
                              {contactName?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className="text-[11px] text-muted-foreground truncate"
                            title={contactName}
                          >
                            {contactName}
                          </span>
                        </div>
                        <span
                          className="text-[10px] text-muted-foreground/60"
                          title={new Date(task.created).toLocaleString()}
                        >
                          {new Date(task.created).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )
                })}
                {columnTasks.length === 0 && !loading && (
                  <div className="h-24 flex items-center justify-center text-sm text-muted-foreground/50 border border-dashed border-white/10 rounded-lg">
                    Vazio
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
