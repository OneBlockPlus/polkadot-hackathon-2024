import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { AppContainer } from '@/components/app/AppContainer'
import { AppHeader } from '@/components/app/AppHeader'
import { useAdmin } from '@/context/admin'

export default function () {
  const { client } = useAdmin()
  const { id = '' } = useParams()
  const [logoUrl, setLogoUrl] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const { data, refetch } = useQuery({
    queryKey: ['getApp', id],
    queryFn: async () => client.admin.getApp(id),
    enabled: client.admin.isAuthorized(),
  })

  useEffect(() => {
    if (data) {
      setLogoUrl(data.logoUrl!)
      setName(data.name)
      setDescription(data.description!)
    }
  }, [data])

  const changeHandler = useCallback(async () => {
    setLoading(true)
    try {
      await client.admin.updateApp(id, { logoUrl, name, description })
      await refetch()
      toast.success('Branding updated')
    } catch (error) {
      console.error(error)
      toast.error('Failed to update branding')
    }
    setLoading(false)
  }, [client.admin, description, id, logoUrl, name, refetch])

  return (
    <AppContainer>
      <AppHeader
        title="Branding"
        subtitle="Set your preferences for your usersʼ experience."
        button={(
          <Button loading={loading} onClick={changeHandler}>
            Save Changes
          </Button>
        )}
      />

      <div className="mt-5 space-y-3">
        <div className="space-y-2">
          <div>Name</div>
          <div className="text-sm text-muted-foreground">
            This name is visible to users on modals, emails, and SMS messages.
          </div>
          <Input value={name ?? ''} placeholder="App name" onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div>Description</div>
          <div className="text-sm text-muted-foreground">This description is description.</div>
          <Input value={description ?? ''} placeholder="Description" onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="space-y-2">
          <div>Your Logo</div>
          <div className="text-sm text-muted-foreground">
            Add a URL of a PNG to display to your users on login. The aspect ratio is 2:1 and recommended size is
            180x90px.
          </div>
          <Input value={logoUrl ?? ''} placeholder="Add logo URL" onChange={e => setLogoUrl(e.target.value)} />
        </div>
      </div>
    </AppContainer>
  )
}
