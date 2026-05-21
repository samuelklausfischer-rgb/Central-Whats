import pb from '@/lib/pocketbase/client'

export interface ScheduledMessage {
  id?: string
  content: string
  scheduled_at: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  device_id: string
  remote_sender: string
  user_id: string
  created?: string
  updated?: string
  expand?: any
}

export const getScheduledMessages = () =>
  pb.collection('scheduled_messages').getFullList({
    sort: '-scheduled_at',
    expand: 'device_id,user_id',
  })

export const createScheduledMessage = (
  data: Omit<ScheduledMessage, 'id' | 'created' | 'updated'>,
) => pb.collection('scheduled_messages').create(data)

export const updateScheduledMessage = (id: string, data: Partial<ScheduledMessage>) =>
  pb.collection('scheduled_messages').update(id, data)

export const deleteScheduledMessage = (id: string) => pb.collection('scheduled_messages').delete(id)
