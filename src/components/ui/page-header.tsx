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
    <div className="flex flex-col gap-4 border-b border-border bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-xl font-semibold tracking-normal text-ink">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-muted">{description}</p> : null}
      </div>
      {action ? (
        <Link href={action.href}>
          <Button>
            {Icon ? <Icon className="size-4" aria-hidden /> : null}
            {action.label}
          </Button>
        </Link>
      ) : null}
    </div>
  );
}
