import pb from '@/lib/pocketbase/client'

export const getContacts = () => pb.collection('contacts').getFullList()
export const getContact = (id: string) => pb.collection('contacts').getOne(id)
export const fetchAvatar = (jid: string, instanceKey: string) =>
  pb.send(`/backend/v1/contacts/${jid}/avatar?instance=${encodeURIComponent(instanceKey)}`, {
    method: 'GET',
  })
