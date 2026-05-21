import pb from '@/lib/pocketbase/client'

export const getDevices = () => pb.collection('devices').getFullList({ sort: 'name' })
export const getDevice = (id: string) => pb.collection('devices').getOne(id)
export const updateDevice = (id: string, data: any) => pb.collection('devices').update(id, data)
