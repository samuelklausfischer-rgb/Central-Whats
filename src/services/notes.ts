import pb from '@/lib/pocketbase/client'

export interface Note {
  id: string
  title: string
  content: string
  user_id: string
  created: string
  updated: string
}

export const getNotes = () => pb.collection('notes').getFullList<Note>({ sort: '-created' })
export const getNote = (id: string) => pb.collection('notes').getOne<Note>(id)
export const createNote = (data: { title: string; content: string; user_id: string }) =>
  pb.collection('notes').create<Note>(data)
export const updateNote = (id: string, data: Partial<{ title: string; content: string }>) =>
  pb.collection('notes').update<Note>(id, data)
export const deleteNote = (id: string) => pb.collection('notes').delete(id)
