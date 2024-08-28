import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'
import { z } from 'zod'

import { AppContainer } from '@/components/app/AppContainer'
import { AppHeader } from '@/components/app/AppHeader'
import { useAdmin } from '@/context/admin'
import { OPENAUTH_ENDPOINT } from '@/utils/constants'

const FormSchema = z.object({
  solana: z.boolean(),
  ethereum: z.boolean(),
  google: z.boolean(),
  discord: z.boolean(),
  telegram: z.boolean(),
  tiktok: z.boolean(),
  github: z.boolean(),
  huggingface: z.boolean(),
  googleClientId: z.string().optional(),
  telegramBotToken: z.string().optional(),
  tiktokClientKey: z.string().optional(),
  tiktokClientSecret: z.string().optional(),
  githubClientId: z.string().optional(),
  githubClientSecret: z.string().optional(),
  huggingfaceClientId: z.string().optional(),
  huggingfaceAppSecret: z.string().optional(),
  discordApplicationId: z.string().optional(),
})

type FormDataType = z.infer<typeof FormSchema>

export default function () {
  const { id: appId = '' } = useParams()
  const { client } = useAdmin()
  const [_, copy] = useCopyToClipboard()
  const { data, refetch } = useQuery({
    queryKey: ['getApp', appId],
    queryFn: async () => client.admin.getApp(appId),
    enabled: client.admin.isAuthorized(),
  })

  const tiktokRedirectUri = `${OPENAUTH_ENDPOINT}/auth/${appId}/tiktok/callback`
  const githubRedirectUri = `${OPENAUTH_ENDPOINT}/auth/${appId}/github/callback`
  const huggingfaceRedirectUri = `${OPENAUTH_ENDPOINT}/auth/${appId}/huggingface/callback`

  const form = useForm<FormDataType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {},
  })

  const watchGoogle = form.watch('google')
  const watchTelegram = form.watch('telegram')
  const watchTikTok = form.watch('tiktok')
  const watchDiscord = form.watch('discord')
  const watchGithub = form.watch('github')
  const watchHuggingface = form.watch('huggingface')

  useEffect(() => {
    if (data) {
      form.setValue('solana', data.solEnabled)
      form.setValue('ethereum', data.ethEnabled)
      form.setValue('google', data.googleEnabled)
      form.setValue('discord', data.discordEnabled)
      form.setValue('tiktok', data.tiktokEnabled)
      form.setValue('github', data.githubEnabled)
      form.setValue('huggingface', data.huggingfaceEnabled)
      form.setValue('telegram', data.telegramEnabled)
      form.setValue('googleClientId', data.googleClientId ?? undefined)
      form.setValue('telegramBotToken', data.telegramBotToken ?? undefined)
      form.setValue('tiktokClientKey', data.tiktokClientKey ?? undefined)
      form.setValue('tiktokClientSecret', data.tiktokClientSecret ?? undefined)
      form.setValue('githubClientId', data.githubClientId ?? undefined)
      form.setValue('githubClientSecret', data.githubClientSecret ?? undefined)
      form.setValue('huggingfaceClientId', data.huggingfaceClientId ?? undefined)
      form.setValue('huggingfaceAppSecret', data.huggingfaceAppSecret ?? undefined)
      form.setValue('discordApplicationId', data.discordApplicationId ?? undefined)
    }
  }, [data, form])

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    await client.admin.updateApp(appId, {
      solEnabled: data.solana,
      ethEnabled: data.ethereum,
      googleEnabled: data.google,
      discordEnabled: data.discord,
      telegramEnabled: data.telegram,
      tiktokEnabled: data.tiktok,
      githubEnabled: data.github,
      huggingfaceEnabled: data.huggingface,
      googleClientId: data.googleClientId,
      telegramBotToken: data.telegramBotToken,
      tiktokClientKey: data.tiktokClientKey,
      tiktokClientSecret: data.tiktokClientSecret,
      githubClientId: data.githubClientId,
      githubClientSecret: data.githubClientSecret,
      huggingfaceClientId: data.huggingfaceClientId,
      huggingfaceAppSecret: data.huggingfaceAppSecret,
      discordApplicationId: data.discordApplicationId,
    })
    toast.success('Settings saved')
    refetch()
  }

  return (
    <AppContainer>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <AppHeader
            title="Login methods"
            subtitle="Select which login and linking methods are enabled for your app. To customize specific methods and how they appear, use client configuration."
            button={<Button onClick={() => form.handleSubmit(onSubmit)}>Save Changes</Button>}
          />
          <div className="mt-5 space-y-3">
            <Checker form={form} id="ethereum" label="Ethereum" />
            <Checker form={form} id="solana" label="Solana" />
            <Checker form={form} id="google" label="Google" />
            {watchGoogle && (
              <FormField
                control={form.control}
                name="googleClientId"
                render={({ field }) => (
                  <FormItem className="pl-8">
                    <FormLabel>Client ID</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <Checker form={form} id="discord" label="Discord" />
            {watchDiscord && (
              <FormField
                control={form.control}
                name="discordApplicationId"
                render={({ field }) => (
                  <FormItem className="pl-8">
                    <FormLabel>Application ID</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <Checker form={form} id="telegram" label="Telegram" />
            {watchTelegram && (
              <FormField
                control={form.control}
                name="telegramBotToken"
                render={({ field }) => (
                  <FormItem className="pl-8">
                    <FormLabel>Bot Token</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <Checker form={form} id="tiktok" label="TikTok" />
            {watchTikTok && (
              <>
                <FormField
                  control={form.control}
                  name="tiktokClientKey"
                  render={({ field }) => (
                    <FormItem className="pl-8">
                      <FormLabel>Client Key</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tiktokClientSecret"
                  render={({ field }) => (
                    <FormItem className="pl-8">
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="pl-8">
                  <FormLabel>
                    Redirect URI (Input on the TikTok Developer Portal)
                  </FormLabel>
                  <div className="flex-center gap-2">
                    <Input value={tiktokRedirectUri} readOnly className="text-muted-foreground" />
                    <Button
                      variant="outline"
                      className="px-3"
                      onClick={async (e) => {
                        e.preventDefault()
                        await copy(tiktokRedirectUri)
                        toast.success('Copied to clipboard')
                      }}
                    >
                      <span className="i-lucide-copy" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            <Checker form={form} id="github" label="Github" />
            {watchGithub && (
              <>
                <FormField
                  control={form.control}
                  name="githubClientId"
                  render={({ field }) => (
                    <FormItem className="pl-8">
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="githubClientSecret"
                  render={({ field }) => (
                    <FormItem className="pl-8">
                      <FormLabel>Client Secret</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="pl-8">
                  <FormLabel>
                    Redirect URI (Input on the Github Developer settings)
                  </FormLabel>
                  <div className="flex-center gap-2">
                    <Input value={githubRedirectUri} readOnly className="text-muted-foreground" />
                    <Button
                      variant="outline"
                      className="px-3"
                      onClick={async (e) => {
                        e.preventDefault()
                        await copy(githubRedirectUri)
                        toast.success('Copied to clipboard')
                      }}
                    >
                      <span className="i-lucide-copy" />
                    </Button>
                  </div>
                </div>
              </>
            )}
            <Checker form={form} id="huggingface" label="Hugging Face" />
            {watchHuggingface && (
              <>
                <FormField
                  control={form.control}
                  name="huggingfaceClientId"
                  render={({ field }) => (
                    <FormItem className="pl-8">
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="huggingfaceAppSecret"
                  render={({ field }) => (
                    <FormItem className="pl-8">
                      <FormLabel>App Secret</FormLabel>
                      <FormControl>
                        <Input value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="pl-8">
                  <FormLabel>
                    Redirect URI (Input on the Huggin Face user settings &gt; Connected Apps)
                  </FormLabel>
                  <div className="flex-center gap-2">
                    <Input value={huggingfaceRedirectUri} readOnly className="text-muted-foreground" />
                    <Button
                      variant="outline"
                      className="px-3"
                      onClick={async (e) => {
                        e.preventDefault()
                        await copy(huggingfaceRedirectUri)
                        toast.success('Copied to clipboard')
                      }}
                    >
                      <span className="i-lucide-copy" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </form>
      </Form>
    </AppContainer>
  )
}

function Checker({ form, id, label }: { form: UseFormReturn<FormDataType>, id: string, label: string }) {
  return (
    <FormField
      control={form.control}
      name={id as any}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start border rounded-md p-4 space-x-3 space-y-0">
          <FormControl>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel>{label}</FormLabel>
        </FormItem>
      )}
    />
  )
}
