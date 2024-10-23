import { ConnectionGuard } from "@/components/wallet/ConnectionGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ConnectionGuard>
      {children}
    </ConnectionGuard>
  )
}
