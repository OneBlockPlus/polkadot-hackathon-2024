import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'

import { AppContainer } from '@/components/app/AppContainer'
import { AppHeader } from '@/components/app/AppHeader'
import { Textarea } from '@/components/ui/textarea'
import { useAdmin } from '@/context/admin'

export default function ApiKeys() {
  const { id = '' } = useParams()
  const { client } = useAdmin()
  const [_, copy] = useCopyToClipboard()
  const [ttl, setTTL] = useState<string>('')

  const { data } = useQuery({
    queryKey: ['getAppSecret', id],
    queryFn: () => client.admin.getAppSecret(id),
    enabled: client.admin.isAuthorized(),
  })

  const { data: appData } = useQuery({
    queryKey: ['getApp', id],
    queryFn: () => client.admin.getApp(id),
    enabled: client.admin.isAuthorized(),
  })

  useEffect(() => {
    if (appData) {
      setTTL(appData.jwtTTL.toString())
    }
  }, [appData])

  const appSecret = useMemo(() => data?.appSecret ?? '', [data])
  const jwtSecret = useMemo(() => data?.jwtSecret ?? '', [data])
  const [showKey, setShowKey] = useState(false)

  return (
    <AppContainer>
      <AppHeader
        title="Welcome"
        subtitle="Here are a few things we recommend doing to to build a delightful, secure experience for your users."
      />
      <div className="mt-6 space-y-6">
        <div className="space-y-1">
          <div>App ID</div>
          <div className="text-sm text-muted-foreground">
            The app ID is used to associate your OpenAuth client with this app.
          </div>
          <div className="flex-center gap-2">
            <Input value={id} readOnly className="text-muted-foreground" />
            <Button
              variant="outline"
              className="px-3"
              onClick={async () => {
                await copy(id)
                toast.success('Copied to clipboard')
              }}
            >
              <span className="i-lucide-copy" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div>App secret</div>
          <div className="text-sm text-muted-foreground">
            OpenAuth does not store your app secret. Please be sure to store it somewhere safe.
          </div>
          <div className="flex-center gap-2">
            <Input value={appSecret} type={showKey ? 'text' : 'password'} readOnly className="text-muted-foreground" />
            <Button
              variant="outline"
              className="px-3"
              onClick={() => {
                setShowKey(!showKey)
              }}
            >
              <span className="i-lucide-eye-off" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div>JWT Public Key</div>
          <div className="text-sm text-muted-foreground">
            The JWT Public Key is used to verify the JWT tokens that are issued by OpenAuth.
          </div>
          <div className="flex-center gap-2">
            <Textarea rows={3} value={jwtSecret} readOnly className="resize-none text-muted-foreground" />
            <Button
              variant="outline"
              className="px-3"
              onClick={async () => {
                await copy(jwtSecret)
                toast.success('Copied to clipboard')
              }}
            >
              <span className="i-lucide-copy" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div>JWT TTL</div>
          <div className="text-sm text-muted-foreground">
            JWT TTL (time to live) is the amount of time in seconds that a JWT token is valid for.
          </div>
          <div className="flex-center gap-2">
            <Input type="number" value={ttl} onChange={e => setTTL(e.target.value)} />
            <Button
              disabled={!ttl}
              variant="outline"
              className="px-3"
              onClick={async () => {
                await client.admin.updateApp(id, { jwtTTL: Number.parseInt(ttl, 10) })
                toast.success('Update successfully')
              }}
            >
              <span className="i-lucide-save" />
            </Button>
          </div>
        </div>
      </div>
    </AppContainer>
  )
}
