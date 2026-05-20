import { useState } from 'react'
import useAppStore, { Lead } from '@/stores/useAppStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Smartphone, GripVertical } from 'lucide-react'

const COLUMNS = [
  {
    id: 'novo',
    title: 'Novo Contato',
    color: 'border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-900',
  },
  {
    id: 'em_progresso',
    title: 'Em Progresso',
    color: 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-900',
  },
  {
    id: 'negociacao',
    title: 'Em Negociação',
    color: 'border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-900',
  },
  {
    id: 'ganho',
    title: 'Ganho',
    color: 'border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900',
  },
  {
    id: 'perdido',
    title: 'Perdido',
    color: 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900',
  },
] as const

export default function CRM() {
  const { leads, updateLeadStatus, devices } = useAppStore()

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId)
  }

  const handleDrop = (e: React.DragEvent, status: Lead['status']) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      updateLeadStatus(leadId, status)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-6rem)]">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CRM Kanban</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe as oportunidades geradas pelas conversas.
        </p>
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {COLUMNS.map((col) => {
          const columnLeads = leads.filter((l) => l.status === col.id)
          return (
            <div
              key={col.id}
              className={`min-w-[300px] w-[300px] rounded-xl border flex flex-col ${col.color}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id as Lead['status'])}
            >
              <div className="p-3 border-b bg-white/50 dark:bg-black/20 rounded-t-xl font-medium flex items-center justify-between">
                <span>{col.title}</span>
                <Badge variant="secondary" className="bg-white dark:bg-slate-800">
                  {columnLeads.length}
                </Badge>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-3">
                {columnLeads.map((lead) => {
                  const device = devices.find((d) => d.id === lead.deviceId)
                  return (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm">{lead.name}</h4>
                          <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {lead.lastNote}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                            <Smartphone className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[80px]">
                              {device?.name || 'Desconhecido'}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {lead.value > 0 ? `R$ ${lead.value.toLocaleString('pt-BR')}` : '-'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
                {columnLeads.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Solte cards aqui</span>
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
