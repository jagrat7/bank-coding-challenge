import { GalleryVerticalEnd } from "lucide-react";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { LoginForm } from "./_components/LoginForm";
import { redirect } from "next/navigation";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const session = await auth();

  if (session?.user) {
    void api.post.getLatest.prefetch();

  }
  if (session){
    redirect("/dashboard");
  }
  return (
    <HydrateClient>
      <main>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <a href="#" className="flex items-center gap-2 self-center font-medium">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Banking Company Inc.
            </a>
            <LoginForm />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
