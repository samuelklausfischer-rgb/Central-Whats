import pb from '@/lib/pocketbase/client'

export const getDevices = () => pb.collection('devices').getFullList({ sort: 'name' })
export const getDevice = (id: string) => pb.collection('devices').getOne(id)
