import useAppStore, { Task } from '@/stores/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, GripVertical, FileText } from 'lucide-react'

const COLUMNS = [
  {
    id: 'pendente',
    title: 'Pendente',
    color: 'border-white/10 bg-zinc-950/30 backdrop-blur-sm text-zinc-300',
  },
  {
    id: 'em_andamento',
    title: 'Em Andamento',
    color: 'border-white/10 bg-blue-950/20 backdrop-blur-sm text-blue-300',
  },
  {
    id: 'revisao',
    title: 'Em Revisão',
    color: 'border-white/10 bg-amber-950/20 backdrop-blur-sm text-amber-300',
  },
  {
    id: 'concluido',
    title: 'Concluído',
    color: 'border-white/10 bg-emerald-950/20 backdrop-blur-sm text-emerald-300',
  },
] as const

export default function CRM() {
  const { tasks, updateTaskStatus, devices } = useAppStore()

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId)
  }

  const handleDrop = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      updateTaskStatus(taskId, status)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      <div>
        <h1 className="bg-clip-text text-transparent bg-gradient-to-br from-gray-200 to-gray-600 text-3xl font-bold tracking-tight">
          Tarefas Internas
        </h1>
        <p className="text-zinc-400 mt-1">
          Quadro Kanban para organização de atividades e acompanhamentos gerados nas conversas.
        </p>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id)
          return (
            <div
              key={col.id}
              className={`min-w-[320px] w-[320px] rounded-xl border flex flex-col ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id as Task['status'])}
            >
              <div className="p-3 border-b border-white/10 bg-black/20 rounded-t-xl font-medium flex items-center justify-between">
                <span>{col.title}</span>
                <Badge
                  variant="secondary"
                  className="bg-black/40 text-zinc-300 text-xs border-white/10"
                >
                  {columnTasks.length}
                </Badge>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {columnTasks.map((task) => {
                  const device = devices.find((d) => d.id === task.deviceId)
                  return (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm leading-tight pr-4">{task.title}</h4>
                          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/10">
                          <div className="flex items-center text-[11px] text-zinc-400 bg-black/40 border border-white/5 px-2 py-1 rounded-md">
                            <Smartphone className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[120px]">
                              {device?.name || 'Desconhecido'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {columnTasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Arraste tarefas aqui</span>
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
