import { Button } from "~/app/_components/ui/button"
import Link from "next/link"
import { auth } from "~/server/auth"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) redirect("/")
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
          <Link href="/dashboard">
                <h2 className="text-lg font-semibold">Banking Company</h2>
          </Link>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              Signed in as {session?.user?.name}
            </p>
            <Button variant="outline" asChild>
              <Link href="/api/auth/signout">Sign out</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
