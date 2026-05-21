import { useState, useEffect } from 'react'
import { updateDevice, getDevices } from '@/services/devices'
import { useToast } from '@/hooks/use-toast'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

function DeviceSignatureItem({ device }: { device: any }) {
  const [signature, setSignature] = useState(device.signature || '')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setSignature(device.signature || '')
  }, [device.signature])

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSaving(true)
    try {
      await updateDevice(device.id, { signature })
      toast({ title: 'Assinatura salva', description: `Para ${device.name}` })
    } catch (err) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <AccordionItem
      value={device.id}
      className="border border-white/10 bg-black/20 rounded-xl px-4 overflow-hidden data-[state=open]:bg-black/30 transition-colors"
    >
      <AccordionTrigger className="hover:no-underline py-4">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="font-semibold text-foreground tracking-tight">{device.name}</div>
          <Badge
            variant="outline"
            className={
              device.status === 'online'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-slate-500/10 text-slate-500 border-slate-500/20'
            }
          >
            {device.status === 'online' ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-3 pt-2 pb-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">
              Assinatura de Mensagem / Apresentação
            </Label>
            <textarea
              className="w-full flex min-h-[100px] rounded-md border border-white/10 bg-black/40 px-3 py-2 text-[14px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500/50 resize-y text-foreground"
              placeholder="Ex: Atenciosamente,&#10;Equipe de Vendas"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-500 text-white"
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

export function SignatureManagerDialog({
  open,
  onOpenChange,
  devices: initialDevices,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  devices?: any[]
}) {
  const [devices, setDevices] = useState<any[]>(initialDevices || [])

  useEffect(() => {
    if (initialDevices) {
      setDevices(initialDevices)
    } else if (open) {
      getDevices().then(setDevices)
    }
  }, [open, initialDevices])

  useRealtime('devices', (e: any) => {
    if (initialDevices) return // Ignore if managed externally
    if (!open) return
    if (e.action === 'create') setDevices((prev) => [e.record, ...prev])
    else if (e.action === 'update')
      setDevices((prev) => prev.map((d) => (d.id === e.record.id ? e.record : d)))
    else if (e.action === 'delete') setDevices((prev) => prev.filter((d) => d.id !== e.record.id))
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col bg-zinc-950/95 border-white/10 text-foreground backdrop-blur-xl p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Assinaturas de Instâncias</DialogTitle>
          <DialogDescription>
            Configure a assinatura de apresentação para cada número do WhatsApp conectado.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 pb-6">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {devices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma instância conectada.
              </p>
            ) : (
              devices.map((device) => <DeviceSignatureItem key={device.id} device={device} />)
            )}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
