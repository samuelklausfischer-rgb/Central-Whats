import { useState, useEffect } from 'react'
import type { RecordModel } from 'pocketbase'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileSignature, Loader2 } from 'lucide-react'
import { updateDevice, getDevices } from '@/services/devices'
import { useToast } from '@/hooks/use-toast'
import { Label } from '@/components/ui/label'
import { useRealtime } from '@/hooks/use-realtime'

export function SignatureManagerDialog() {
  const [open, setOpen] = useState(false)
  const [devices, setDevices] = useState<RecordModel[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadDevices = async () => {
    try {
      setIsLoading(true)
      const data = await getDevices()
      setDevices(data)
    } catch (e) {
      console.error('Failed to load devices:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadDevices()
    }
  }, [open])

  useRealtime(
    'devices',
    () => {
      if (open) loadDevices()
    },
    open,
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSignature className="h-4 w-4" /> Gerenciar Assinaturas
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Assinaturas dos Aparelhos</DialogTitle>
          <DialogDescription>
            Configure a assinatura ou apresentação padrão para cada aparelho conectado.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 mt-2 h-[50vh] min-h-[300px]">
          {isLoading && devices.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {devices.map((device) => (
                <DeviceSignatureItem key={device.id} device={device} />
              ))}
              {devices.length === 0 && !isLoading && (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  Nenhum aparelho encontrado.
                </div>
              )}
            </Accordion>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function DeviceSignatureItem({ device }: { device: RecordModel }) {
  const [signature, setSignature] = useState(device.signature || '')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Update local state if the external data changes
  useEffect(() => {
    setSignature(device.signature || '')
  }, [device.signature])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateDevice(device.id, { signature })
      toast({
        title: 'Assinatura salva',
        description: `A assinatura do aparelho ${device.name} foi atualizada.`,
      })
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível atualizar a assinatura do aparelho.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const isChanged = signature !== (device.signature || '')

  return (
    <AccordionItem value={device.id}>
      <AccordionTrigger className="hover:no-underline text-left">
        <div className="flex flex-col items-start">
          <span className="font-medium">{device.name}</span>
          <span className="text-xs text-muted-foreground font-normal">
            {device.department || 'Geral'}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4 pt-2 pb-4 px-1">
          <div className="space-y-2">
            <Label htmlFor={`signature-${device.id}`}>Assinatura / Apresentação</Label>
            <Textarea
              id={`signature-${device.id}`}
              placeholder="Ex: Olá, aqui é o atendimento do almoxarifado..."
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="min-h-[100px] resize-y"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving || !isChanged} size="sm">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Assinatura
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
