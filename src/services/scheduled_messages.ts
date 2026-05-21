import pb from '@/lib/pocketbase/client'

export interface ScheduledMessage {
  id?: string
  content: string
  scheduled_at: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  device_id: string
  remote_sender: string
  user_id: string
  attachments?: string[] // filenames returned by pb
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
  data: Omit<ScheduledMessage, 'id' | 'created' | 'updated' | 'attachments'> & {
    attachments?: File[]
  },
) => {
  if (data.attachments && data.attachments.length > 0) {
    const formData = new FormData()
    formData.append('content', data.content)
    formData.append('scheduled_at', data.scheduled_at)
    formData.append('status', data.status)
    formData.append('device_id', data.device_id)
    formData.append('remote_sender', data.remote_sender)
    formData.append('user_id', data.user_id)

    data.attachments.forEach((file) => {
      formData.append('attachments', file)
    })

    return pb.collection('scheduled_messages').create(formData)
  }

  return pb.collection('scheduled_messages').create(data)
}

export const updateScheduledMessage = (id: string, data: Partial<ScheduledMessage>) =>
  pb.collection('scheduled_messages').update(id, data)

export const deleteScheduledMessage = (id: string) => pb.collection('scheduled_messages').delete(id)
