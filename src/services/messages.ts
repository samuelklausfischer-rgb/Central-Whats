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
}) => pb.collection('messages').create({ ...data, direction: 'outbound' })
