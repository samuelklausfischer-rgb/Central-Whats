import pb from '@/lib/pocketbase/client'

export const getMessages = (deviceId: string) =>
  pb.collection('messages').getFullList({
    filter: `device_id = '${deviceId}'`,
    sort: 'created',
  })

export const sendMessage = (data: {
  content: string
  device_id: string
  sender_id: string
  is_read: boolean
  direction?: string
  remote_sender?: string
  attachments?: File[]
}) => {
  if (data.attachments && data.attachments.length > 0) {
    const formData = new FormData()
    formData.append('content', data.content)
    formData.append('device_id', data.device_id)
    formData.append('sender_id', data.sender_id)
    formData.append('is_read', data.is_read.toString())
    formData.append('direction', 'outbound')
    if (data.remote_sender) formData.append('remote_sender', data.remote_sender)

    data.attachments.forEach((file) => {
      formData.append('attachments', file)
    })

    return pb.collection('messages').create(formData)
  }

  return pb.collection('messages').create({ ...data, direction: 'outbound' })
}
