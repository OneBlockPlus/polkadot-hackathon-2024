import AppLayout from '@/app/acme/layouts/app-layout'


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppLayout>{children}</AppLayout>
}
