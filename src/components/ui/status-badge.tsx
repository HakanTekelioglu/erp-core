import { Badge } from "@/components/ui/badge";

const warningStatuses = ["PENDING", "ORDERED", "PARTIALLY_PAID", "Kritik"];
const successStatuses = ["APPROVED", "COMPLETED", "RECEIVED", "PAID", "Aktif"];
const dangerStatuses = ["CANCELLED", "UNPAID", "Pasif"];

export function StatusBadge({ status }: { status: string }) {
  const tone = warningStatuses.includes(status)
    ? "warning"
    : successStatuses.includes(status)
      ? "success"
      : dangerStatuses.includes(status)
        ? "danger"
        : "muted";

  return <Badge tone={tone}>{status}</Badge>;
}
