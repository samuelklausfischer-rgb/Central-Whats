/* Input Component - A component that displays an input - from shadcn/ui (exposes Input) */
import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-white/10 bg-zinc-950/50 backdrop-blur-sm px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-100 placeholder:text-zinc-400 text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E40AF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
