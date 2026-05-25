import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

export function SignatureManagerDialog({ open, onOpenChange, devices }: any) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gerenciar Assinaturas</DialogTitle>
          <DialogDescription>
            Configure assinaturas personalizadas para os dispositivos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 text-sm text-muted-foreground">Em desenvolvimento...</div>
      </DialogContent>
    </Dialog>
  )
}
