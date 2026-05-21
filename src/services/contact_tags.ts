import pb from '@/lib/pocketbase/client'

export const getContactTags = (deviceId: string) =>
  pb.collection('contact_tags').getFullList({
    filter: `device_id = '${deviceId}'`,
    expand: 'label_id',
  })

export const toggleContactTag = async (deviceId: string, remoteSender: string, labelId: string) => {
  const existing = await pb.collection('contact_tags').getList(1, 1, {
    filter: `device_id = '${deviceId}' && remote_sender = '${remoteSender}' && label_id = '${labelId}'`,
  })

  if (existing.items.length > 0) {
    await pb.collection('contact_tags').delete(existing.items[0].id)
    return { action: 'removed', id: existing.items[0].id }
  } else {
    const created = await pb.collection('contact_tags').create({
      device_id: deviceId,
      remote_sender: remoteSender,
      label_id: labelId,
    })
    return { action: 'added', id: created.id }
  }
}
