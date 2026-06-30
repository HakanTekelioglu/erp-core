"use client";

import { Power, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ActiveToggleRowButtonProps = {
  id: string;
  isActive: boolean;
  activateAction: (id: string) => Promise<void>;
  deactivateAction: (id: string) => Promise<void>;
  entityName: string;
};

export function ActiveToggleRowButton({
  id,
  isActive,
  activateAction,
  deactivateAction,
  entityName
}: ActiveToggleRowButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const Icon = isActive ? PowerOff : Power;
  const label = isActive ? "Pasiflestir" : "Aktiflestir";
  const action = isActive ? deactivateAction : activateAction;
  const nextState = isActive ? "pasiflestirmek" : "aktiflestirmek";
  const successState = isActive ? "pasiflestirildi" : "aktiflestirildi";

  function handleClick() {
    if (!window.confirm(`Bu ${entityName} kaydini ${nextState} istiyor musunuz?`)) return;

    startTransition(async () => {
      try {
        await action(id);
        toast.success(`${entityName} ${successState}`);
        router.refresh();
      } catch {
        toast.error(`${entityName} durumu guncellenemedi`);
      }
    });
  }

  return (
    <Button type="button" variant={isActive ? "danger" : "secondary"} className="min-h-9 px-3" onClick={handleClick} disabled={isPending}>
      <Icon className="size-4" aria-hidden />
      {label}
    </Button>
  );
}
