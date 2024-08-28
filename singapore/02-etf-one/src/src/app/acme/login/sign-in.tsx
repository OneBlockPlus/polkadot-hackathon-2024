'use client'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { signInUseServer } from '@/app/login/actions'
import { useFormState } from 'react-dom'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ConnectPolkadot from '@/app/acme/login/connectPolkadot'
import { ConnectMetaMask } from '@/app/acme/login/connectMetaMask'


const initialState = {
  message: '',
}

export function SignIn() {
  const [state, formAction] = useFormState(signInUseServer, initialState)

  return (
    <div className={'grid gap-4 mt-8' }>
      <ConnectPolkadot />
      <ConnectMetaMask />
      <div className="relative mt-8">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground"></span>
        </div>
      </div>
      <form action={formAction} className="grid gap-4">
        {
          // Error handling
          state?.message && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.message}</AlertDescription>
            </Alert>
          )
        }

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            placeholder="m@example.com"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Forgot your password?
            </Link>
          </div>
          <Input name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>

    </div>
  )
}
