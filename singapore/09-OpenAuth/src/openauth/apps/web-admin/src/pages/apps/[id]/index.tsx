import { Link, useLocation, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'

import { AppContainer } from '@/components/app/AppContainer'
import { AppHeader } from '@/components/app/AppHeader'

export default function () {
  const { pathname } = useLocation()
  const { id } = useParams()
  const [_, copy] = useCopyToClipboard()

  const onCopyAppId = async () => {
    try {
      await copy(id ?? '')
      toast.success('Copied to clipboard')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AppContainer>
      <AppHeader
        title="Welcome"
        subtitle="Here are a few things we recommend doing to to build a delightful, secure experience for your users."
      />

      <div className="mt-5 space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>App ID</CardTitle>
            <CardDescription>Unique identifier for your app.</CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="mr-2 font-bold">{id}</div>
            <Button
              variant="ghost"
              onClick={onCopyAppId}
            >
              <span className="i-lucide-copy" />
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Customize to match your brand</CardTitle>
            <CardDescription>Add your logo and colors to make OpenAuth yours.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to={`${pathname}/branding`} className="flex-center gap-1 font-bold">
              Branding
              <span className="i-lucide:arrow-right h-4 w-4 inline-flex translate-y-0.25" />
            </Link>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Set user login methods</CardTitle>
            <CardDescription>Select the login methods you want to enable in your app.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to={`${pathname}/login-methods`} className="flex-center gap-1 font-bold">
              Login methods
              <span className="i-lucide:arrow-right h-4 w-4 inline-flex translate-y-0.25" />
            </Link>
          </CardFooter>
        </Card>
      </div>
    </AppContainer>
  )
}
