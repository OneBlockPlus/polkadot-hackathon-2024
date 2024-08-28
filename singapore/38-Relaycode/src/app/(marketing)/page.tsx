import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-4 font-mono">Relaycode</h1>
        <p className="text-xl mb-8">
          Intuitive extrinsics builder for Polkadot ecosystem
        </p>
        <Link href="/builder">
          <Button size="lg">Get Started</Button>
        </Link>
      </section>

      {/* Feature Sections */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Simplify Complex Pallet Interactions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Real-time Encoding</h3>
              <p>See your extrinsics encoded in real-time as you build them.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Wallet Integration</h3>
              <p>
                Seamlessly connect your wallet and submit extrinsics directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Streamline Your Workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-2">Shareable Snippets</h3>
              <p>
                Create and share reusable extrinsic templates with your team.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">
                Intuitive Interface
              </h3>
              <p>User-friendly design makes building extrinsics a breeze.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
