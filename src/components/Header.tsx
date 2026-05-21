import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { Link } from 'react-router-dom'

export function Header() {
  const { user, signOut } = useAuth()

  const avatarUrl = user?.avatar
    ? pb.files.getURL(user, user.avatar)
    : `https://img.usecurling.com/ppl/thumbnail?seed=${user?.id || 'admin'}`

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-white/10 bg-black/40 px-4 backdrop-blur-xl sm:px-6">
      <SidebarTrigger className="-ml-1 text-gray-400 hover:text-white" />

      <div className="flex flex-1 items-center gap-4 md:gap-8">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar conversas, tarefas ou anotações..."
            className="w-full rounded-full bg-white/5 pl-10 border-white/10 text-gray-200 placeholder:text-gray-500 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white/10 transition-all duration-200 h-10"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 animate-pulse-ring"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="rounded-full h-10 pl-2 pr-4 gap-2 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all duration-200"
              >
                <Avatar className="h-7 w-7 border border-white/20">
                  <AvatarImage src={avatarUrl} alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-blue-900 text-blue-200">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-200 hidden sm:block">
                  {user?.name || user?.username || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-slate-900/95 backdrop-blur-xl border-white/10 text-gray-200"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-white">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs leading-none text-gray-400">@{user?.username}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                asChild
                className="focus:bg-white/10 focus:text-white cursor-pointer"
              >
                <Link to="/settings/general">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Perfil e Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={signOut}
                className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
