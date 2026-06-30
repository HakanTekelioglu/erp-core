import { Badge } from "@/components/ui/badge";

const warningStatuses = ["PENDING", "ORDERED", "PARTIALLY_PAID", "Kismi odendi", "Kritik"];
const successStatuses = ["APPROVED", "COMPLETED", "RECEIVED", "PAID", "Odendi", "Satis faturasi", "Aktif"];
const dangerStatuses = ["CANCELLED", "UNPAID", "Odenmedi", "Iptal", "Pasif"];

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
