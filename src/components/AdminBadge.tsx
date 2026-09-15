import { ShieldCheckIcon } from "lucide-react";

// "Admin" badge shown next to a username
export default function AdminBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-xs font-medium">
      <ShieldCheckIcon className="size-3" /> Admin
    </span>
  );
}
