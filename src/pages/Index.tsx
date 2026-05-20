import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  Smartphone,
  MessageSquareText,
  TrendingUp,
  StickyNote,
  ArrowUpRight,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import useAppStore from '@/stores/useAppStore'
import { Link } from 'react-router-dom'

const chartData = [
  { date: '14 Mai', mensagens: 120 },
  { date: '15 Mai', mensagens: 180 },
  { date: '16 Mai', mensagens: 250 },
  { date: '17 Mai', mensagens: 190 },
  { date: '18 Mai', mensagens: 310 },
  { date: '19 Mai', mensagens: 280 },
  { date: '20 Mai', mensagens: 400 },
]

export default function Index() {
  const { devices, threads, leads, notes } = useAppStore()

  const totalDevices = devices.length
  const unreadMessages = threads.filter((t) => t.unread).length
  const activeLeads = leads.filter((l) => l.status !== 'ganho' && l.status !== 'perdido').length
  const totalNotes = notes.length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Resumo das atividades da sua central de atendimento.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/settings/devices">Gerenciar Aparelhos</Link>
          </Button>
          <Button asChild>
            <Link to="/chat">Abrir Mensagens</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm border-none bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aparelhos Conectados
            </CardTitle>
            <Smartphone className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <Activity className="h-3 w-3 mr-1" /> Todos online
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mensagens Não Lidas
            </CardTitle>
            <MessageSquareText className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadMessages}</div>
            <p className="text-xs text-muted-foreground mt-1">Requer atenção</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Leads Ativos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeads}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" /> +12% esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white dark:bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anotações Hoje
            </CardTitle>
            <StickyNote className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotes}</div>
            <p className="text-xs text-muted-foreground mt-1">Organizado e em dia</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-5 shadow-sm border-none bg-white dark:bg-card">
          <CardHeader>
            <CardTitle>Volume de Mensagens</CardTitle>
            <CardDescription>
              Tráfego total de todos os aparelhos nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  mensagens: {
                    label: 'Mensagens',
                    color: 'hsl(var(--primary))',
                  },
                }}
                className="h-full w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-mensagens)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-mensagens)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="mensagens"
                      stroke="var(--color-mensagens)"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#fillColor)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm border-none bg-white dark:bg-card">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>Atualizações em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  time: '10:45',
                  text: 'Suporte Vendas recebeu 2 novas mensagens',
                  icon: MessageSquareText,
                  color: 'text-blue-500',
                  bg: 'bg-blue-100 dark:bg-blue-900',
                },
                {
                  time: '09:20',
                  text: 'Nota adicionada ao Lead "Empresa X"',
                  icon: StickyNote,
                  color: 'text-purple-500',
                  bg: 'bg-purple-100 dark:bg-purple-900',
                },
                {
                  time: 'Ontem',
                  text: 'Novo aparelho sincronizado com sucesso',
                  icon: Smartphone,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-100 dark:bg-emerald-900',
                },
                {
                  time: 'Ontem',
                  text: 'Lead "Ana Souza" movido para Ganho',
                  icon: TrendingUp,
                  color: 'text-amber-500',
                  bg: 'bg-amber-100 dark:bg-amber-900',
                },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`mt-0.5 rounded-full p-2 ${activity.bg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
