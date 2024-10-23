import { Profile } from '@/utils/types'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'
import { comicFont } from '@/utils/fonts'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { IconEdit, IconLoader2 } from '@tabler/icons-react'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form'
import { useRef, useState } from 'react'
import { trpc } from '@/utils/trpc'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type Props = {
  profile: Profile
}

const formSchema = z.object({
  username: z.string().min(1, {
    message: "Username can't be empty",
  }),
  bio: z.string().optional(),
  avatar: z.string().optional(),
})

export function UpdateProfileDialog({ profile }: Props) {
  const fileUploadRef = useRef<HTMLInputElement>(null)
  const utils = trpc.useUtils()
  const { mutateAsync: updateProfile, isPending } = trpc.user.profile.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.profile.getProfile.invalidate({
        id: profile.id,
      })
    },
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: profile.username ?? '',
      bio: profile.bio ?? '',
      avatar: profile.avatar,
    },
  })
  const [open, setOpen] = useState<boolean>(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant={'link'} className="text-neon text-sm py-1">
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle className={cn('flex justify-center', comicFont.className)}>Edit Profile</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (values: z.infer<typeof formSchema>) => {
            if (isPending) {
              return
            }
            await updateProfile(values)
            setOpen(false)
          })}
        >
          <Form {...form}>
            <div className="flex justify-center gap-2 items-center w-full flex-col p-4">
              <FormField
                name="avatar"
                control={form.control}
                render={({ field }) => (
                  <div
                    className="relative cursor-pointer w-fit"
                    onClick={() => {
                      if (fileUploadRef.current) {
                        fileUploadRef.current.click()
                      }
                    }}
                  >
                    <img
                      src={field.value || field.value}
                      className="size-20 overflow-hidden rounded-full object-cover"
                      alt=""
                    />
                    <IconEdit className="absolute right-0 bottom-0 bg-background rounded-full p-1 cursor-pointer" />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      className="hidden"
                      ref={fileUploadRef}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          const maxSize = 1024 * 1024 * 5
                          if (file.size > maxSize) {
                            toast.error('Max file size is 5MB')
                            return
                          }
                          reader.onloadend = () => {
                            form.setValue('avatar', reader.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                  </div>
                )}
              />
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full px-2 flex flex-col gap-2">
                    <FormLabel>name</FormLabel>
                    <FormControl>
                      <Input value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="bio"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="w-full px-2 flex flex-col gap-2">
                    <FormLabel>bio</FormLabel>
                    <FormControl>
                      <Textarea value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="flex !justify-center flex-row ">
              <Button variant={'ghost'} className="border-neon border flex gap-2" type="submit">
                {isPending ? <IconLoader2 className="animate-spin" /> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </Form>
        </form>
      </DialogContent>
    </Dialog>
  )
}
