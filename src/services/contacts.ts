import pb from '@/lib/pocketbase/client'

export const getContacts = () => pb.collection('contacts').getFullList()
export const getContact = (id: string) => pb.collection('contacts').getOne(id)

// Queue and deduplication for avatar fetching to prevent 429 Too Many Requests
const avatarFetchPromises = new Map<string, Promise<any>>()
const avatarFailedSet = new Set<string>()

// Simple concurrency queue to throttle API requests
const MAX_CONCURRENT_REQUESTS = 2
let activeRequests = 0
const requestQueue: (() => void)[] = []

const processQueue = () => {
  if (activeRequests < MAX_CONCURRENT_REQUESTS && requestQueue.length > 0) {
    const next = requestQueue.shift()
    if (next) {
      activeRequests++
      next()
    }
  }
}

const enqueueRequest = <T>(task: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(() => {
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeRequests--
          processQueue()
        })
    })
    processQueue()
  })
}

export const fetchAvatar = (jid: string, instanceKey: string) => {
  const cacheKey = `${instanceKey}:${jid}`

  // Skip if we already failed to fetch this recently
  if (avatarFailedSet.has(cacheKey)) {
    return Promise.reject(new Error('Throttled: Previous fetch failed.'))
  }

  // Deduplicate ongoing requests
  if (avatarFetchPromises.has(cacheKey)) {
    return avatarFetchPromises.get(cacheKey)!
  }

  const promise = enqueueRequest(() =>
    pb.send(`/backend/v1/contacts/${jid}/avatar?instance=${encodeURIComponent(instanceKey)}`, {
      method: 'GET',
    }),
  )
    .catch((err) => {
      // Add to failed set to prevent spamming the API
      avatarFailedSet.add(cacheKey)
      // Keep it blocked for 2 minutes to recover from rate limits
      setTimeout(() => avatarFailedSet.delete(cacheKey), 120000)
      throw err
    })
    .finally(() => {
      // Remove from active promises after a short delay to prevent instant re-fetches
      setTimeout(() => avatarFetchPromises.delete(cacheKey), 10000)
    })

  avatarFetchPromises.set(cacheKey, promise)
  return promise
}
