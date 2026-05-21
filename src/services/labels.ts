import pb from '@/lib/pocketbase/client'

export const getLabels = () => pb.collection('labels').getFullList({ sort: '-created' })
export const createLabel = (data: { name: string; color: string; user_id: string }) =>
  pb.collection('labels').create(data)
export const updateLabel = (id: string, data: Partial<{ name: string; color: string }>) =>
  pb.collection('labels').update(id, data)
export const deleteLabel = (id: string) => pb.collection('labels').delete(id)
