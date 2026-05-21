import { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Building2 } from 'lucide-react'
import { fetchAvatar } from '@/services/contacts'

export function SmartAvatar({
  jid,
  name,
  instanceKey,
  contactRecord,
  deviceRecord,
  isInstance = false,
  className,
  fallbackClassName,
}: any) {
  const [imgError, setImgError] = useState(false)
  const isFetchingRef = useRef(false)
  const fetchedJidRef = useRef<string | null>(null)

  const record = isInstance ? deviceRecord : contactRecord
  const avatarUrl = record?.avatar_url

  const isOld =
    !isInstance &&
    (!record?.avatar_updated_at ||
      new Date().getTime() - new Date(record.avatar_updated_at).getTime() > 24 * 60 * 60 * 1000)
  const missingUrl = !isInstance && !avatarUrl

  useEffect(() => {
    if (
      !isInstance &&
      jid &&
      instanceKey &&
      (missingUrl || isOld) &&
      !isFetchingRef.current &&
      jid !== 'Unknown Sender' &&
      fetchedJidRef.current !== jid
    ) {
      isFetchingRef.current = true
      fetchedJidRef.current = jid
      fetchAvatar(jid, instanceKey)
        .catch(() => {})
        .finally(() => {
          // We intentionally do not reset isFetchingRef here.
          // This prevents the same component from retrying aggressively on every re-render if it fails.
          // The request deduplication/throttling at the service level will also protect the API.
        })
    }
  }, [jid, instanceKey, missingUrl, isOld, isInstance])

  const handleImageError = () => {
    setImgError(true)
    if (
      !isInstance &&
      jid &&
      instanceKey &&
      !isFetchingRef.current &&
      jid !== 'Unknown Sender' &&
      fetchedJidRef.current !== jid
    ) {
      isFetchingRef.current = true
      fetchedJidRef.current = jid
      fetchAvatar(jid, instanceKey).catch(() => {})
    }
  }

  // Reset imgError and fetching ref if the url changes externally (e.g. from real-time sync)
  useEffect(() => {
    if (avatarUrl) {
      setImgError(false)
      fetchedJidRef.current = null
      isFetchingRef.current = false
    }
  }, [avatarUrl])

  const showInitials =
    name && name !== 'Unknown Sender'
      ? name.substring(0, 2).toUpperCase()
      : jid && jid !== 'Unknown Sender'
        ? jid.substring(0, 2).toUpperCase()
        : ''

  return (
    <Avatar className={className}>
      {avatarUrl && !imgError && (
        <AvatarImage
          src={avatarUrl}
          alt={name || jid}
          onError={handleImageError}
          className="object-cover"
        />
      )}
      <AvatarFallback className={fallbackClassName}>
        {showInitials ||
          (isInstance ? (
            <Building2 className="h-5 w-5 opacity-50" />
          ) : (
            <User className="h-5 w-5 opacity-50" />
          ))}
      </AvatarFallback>
    </Avatar>
  )
}
