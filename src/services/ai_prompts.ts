import pb from '@/lib/pocketbase/client'

export interface AiPrompt {
  id: string
  label: string
  action_key: string
  system_prompt: string
  is_active: boolean
  user_id: string
  created: string
  updated: string
}

export const getAiPrompts = () =>
  pb.collection('ai_assistant_prompts').getFullList<AiPrompt>({ sort: 'created' })

export const createAiPrompt = (data: Partial<AiPrompt>) =>
  pb.collection('ai_assistant_prompts').create<AiPrompt>(data)

export const updateAiPrompt = (id: string, data: Partial<AiPrompt>) =>
  pb.collection('ai_assistant_prompts').update<AiPrompt>(id, data)

export const deleteAiPrompt = (id: string) => pb.collection('ai_assistant_prompts').delete(id)
