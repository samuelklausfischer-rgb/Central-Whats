import { useState, useEffect } from 'react'
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
  const [isFetching, setIsFetching] = useState(false)

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
      !isFetching &&
      jid !== 'Unknown Sender'
    ) {
      setIsFetching(true)
      fetchAvatar(jid, instanceKey)
        .catch(() => {})
        .finally(() => setIsFetching(false))
    }
  }, [jid, instanceKey, missingUrl, isOld, isInstance])

  const handleImageError = () => {
    setImgError(true)
    if (!isInstance && jid && instanceKey && !isFetching && jid !== 'Unknown Sender') {
      setIsFetching(true)
      fetchAvatar(jid, instanceKey)
        .catch(() => {})
        .finally(() => setIsFetching(false))
    }
  }

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
