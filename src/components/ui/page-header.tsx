import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
};

export function PageHeader({ title, description, action }: PageHeaderProps) {
  const Icon = action?.icon;

  return (
    <div className="flex animate-fade-in flex-col gap-4 px-4 pb-2 pt-6 md:flex-row md:items-end md:justify-between md:pt-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-1.5 max-w-3xl text-sm text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href} className="shrink-0">
          <Button>
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            {action.label}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
