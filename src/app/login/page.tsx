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

    toast.success("Giris Basarili");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center gap-2.5">
          <span className="brand-gradient inline-flex size-9 items-center justify-center rounded-lg text-white shadow-sm ring-1 ring-inset ring-white/20">
            <Factory className="size-[18px]" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight text-ink">miniERP</span>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Tekrar hos geldiniz</h1>
            <p className="mt-2 text-sm text-muted">Yetkili kullanici girisi. Devam etmek icin hesabiniza giris yapin.</p>
            <div className="mt-8 grid gap-4">
              <Input
                label="E-posta"
                type="email"
                autoComplete="email"
                placeholder="ornek@sirket.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                label="Sifre"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Button className="mt-6 h-10 w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current" aria-hidden />
              ) : (
                <LogIn className="size-4" aria-hidden />
              )}
              Giris yap
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted">© {new Date().getFullYear()} miniERP</p>
      </section>

      <aside className="relative hidden overflow-hidden bg-zinc-950 lg:block" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#8b5cf6_0%,transparent_55%),radial-gradient(ellipse_at_bottom_left,#4f46e5_0%,transparent_60%)] opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        <div className="relative flex h-full flex-col justify-center px-16">
          <div className="max-w-md">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="text-sm text-white/70">Aylik performans</p>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-emerald-300/30">
                  Canli
                </span>
              </div>
              <div className="mt-6 flex h-28 items-end gap-2.5">
                {[38, 52, 44, 66, 58, 74, 62, 88, 80, 96].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-400/40 to-violet-300/90"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="ml-10 mt-5 rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md">
              <p className="text-xl font-semibold leading-snug tracking-tight">Stok, satis ve finans tek ekranda.</p>
              <p className="mt-2 text-sm text-white/70">Isletmenizin tum operasyonlarini sade ve hizli bir panelden yonetin.</p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
