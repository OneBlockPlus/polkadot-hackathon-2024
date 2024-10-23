import AppLayout from '@/app/layouts/app-layout'


export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppLayout>{children}</AppLayout>
}
