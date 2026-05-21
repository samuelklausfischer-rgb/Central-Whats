import pb from '@/lib/pocketbase/client'

export interface MessageTrigger {
  id: string
  title: string
  content: string
  user_id: string
  created: string
  updated: string
}

export const getTriggers = () =>
  pb.collection('message_triggers').getFullList<MessageTrigger>({ sort: '-created' })

export const createTrigger = (data: { title: string; content: string; user_id: string }) =>
  pb.collection('message_triggers').create<MessageTrigger>(data)

export const updateTrigger = (id: string, data: Partial<{ title: string; content: string }>) =>
  pb.collection('message_triggers').update<MessageTrigger>(id, data)

export const deleteTrigger = (id: string) => pb.collection('message_triggers').delete(id)
