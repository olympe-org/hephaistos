// Badge for a feature enabled on an account
export default function FeatureBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium">
      {label}
    </span>
  );
}
