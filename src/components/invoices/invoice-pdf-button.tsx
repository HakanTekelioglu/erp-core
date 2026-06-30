"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InvoicePdfButton() {
  return (
    <Button type="button" variant="secondary" className="mt-5 w-full print:hidden" onClick={() => window.print()}>
      <Printer className="size-4" />
      PDF cikti hazirla
    </Button>
  );
}
