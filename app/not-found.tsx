"use client";

import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import { useRouter } from "next/navigation";


export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-border flex items-center border-b px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold">Persona Chat</h1>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <div className="space-y-2">
          <p className="text-primary text-6xl font-bold tracking-tight">404</p>
          <h2 className="text-foreground text-2xl font-semibold">
            Page not found
          </h2>
          <p className="text-muted-foreground max-w-md text-sm">
            The page you are looking for does not exist or may have been moved.
          </p>
        </div>

        <Button type="button" onClick={() => router.push("/")}>
          <HomeIcon />
          Back to Home
        </Button>
      </main>
    </div>
  );
}
