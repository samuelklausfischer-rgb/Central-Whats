import { useState } from 'react'
import { Plus, Pin, Calendar, Smartphone, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import useAppStore from '@/stores/useAppStore'
import { useToast } from '@/hooks/use-toast'

export default function Notes() {
  const { notes, addNote } = useAppStore()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const handleCreate = () => {
    if (!newTitle.trim()) return
    addNote({ title: newTitle, content: newContent, pinned: false })
    setIsDialogOpen(false)
    setNewTitle('')
    setNewContent('')
    toast({ title: 'Anotação criada', description: 'Sua anotação foi salva com sucesso.' })
  }

  const filteredNotes = notes
    .filter(
      (n) =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anotações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie anotações rápidas e informações importantes.
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar anotações..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Registro Interno</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Lembrete de Reunião"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Conteúdo</Label>
                  <Textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Descreva detalhes, acompanhamentos ou dados importantes..."
                    className="min-h-[150px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate}>Salvar Registro</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <Card
            key={note.id}
            className={`group relative overflow-hidden transition-all hover:shadow-md ${note.pinned ? 'border-primary/50 bg-primary/5' : ''}`}
          >
            {note.pinned && (
              <div className="absolute top-4 right-4">
                <Pin className="h-4 w-4 text-primary fill-primary" />
              </div>
            )}
            <CardHeader className="pb-3 pr-10">
              <CardTitle className="text-lg leading-tight">{note.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                {note.content}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {note.date}
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> Geral
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white dark:bg-card border border-dashed rounded-xl">
          <StickyNote className="h-12 w-12 mb-4 opacity-20" />
          <p>Nenhuma anotação encontrada.</p>
        </div>
      )}
    </div>
  )
}
