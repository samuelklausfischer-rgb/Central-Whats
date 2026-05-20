import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await signIn(email, password)
    if (!error) navigate('/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <form
        onSubmit={handleLogin}
        className="p-8 bg-card rounded-xl shadow-sm border space-y-6 w-[400px]"
      >
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">CentralCell</h1>
          <p className="text-sm text-muted-foreground">
            Faça login com suas credenciais corporativas.
          </p>
        </div>
        <div className="space-y-4">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            placeholder="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button className="w-full h-11 text-base" type="submit">
          Entrar
        </Button>
      </form>
    </div>
  )
}
