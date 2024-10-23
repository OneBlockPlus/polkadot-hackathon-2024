import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { useAdmin } from '@/context/admin'

export default function () {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const { client } = useAdmin()

  const onSubmit = async () => {
    setLoading(true)
    try {
      await client.admin.createApp({ name })
      toast.success('App created successfully')
      nav('/apps')
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
        <CardTitle className="text-2xl">Create App</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="username">App Name</Label>
          <Input id="username" type="text" value={name} onChange={e => setName(e.target.value)} />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" disabled={!name || loading} onClick={onSubmit}>
          Create
        </Button>
      </CardFooter>
    </Card>
  )
}
