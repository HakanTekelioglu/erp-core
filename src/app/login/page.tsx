"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Factory, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setIsLoading(false);

    if (result?.error) {
      toast.error("E-posta veya sifre hatali");
      return;
    }

    toast.success("Giris basarili");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-11 items-center justify-center rounded-md bg-brand text-white">
            <Factory className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-ink">Kucuk Isletme ERP Sistemi</h1>
            <p className="text-sm text-muted">Yetkili kullanici girisi</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          <Input label="E-posta" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <Input label="Sifre" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <Button className="mt-6 w-full" type="submit" disabled={isLoading}>
          <LogIn className="size-4" aria-hidden />
          Giris yap
        </Button>
      </form>
    </main>
  );
}
