import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAdmin } from '@/context/admin'
import { useQueryAdminConfig } from '@/hooks/useSetupChecker'

export default function () {
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)

  const { client } = useAdmin()
  const { data, refetch } = useQueryAdminConfig()

  useEffect(() => {
    if (data?.initialized) {
      nav('/login')
    }
  }, [data?.initialized, nav])

  const onLogIn = async () => {
    setLoading(true)
    try {
      await client.admin.setup({ username, password })
      await refetch()
      toast.success('Setup successfully')
      nav('/login')
    } catch (error: any) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mx-auto my-20 max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Setup</CardTitle>
        <CardDescription>Setup your admin account.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Confirm Password</Label>
          <Input id="password" type="password" value={password2} onChange={e => setPassword2(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          disabled={!username || !password || password !== password2 || loading}
          onClick={onLogIn}
        >
          Set up
        </Button>
      </CardFooter>
    </Card>
  )
}
