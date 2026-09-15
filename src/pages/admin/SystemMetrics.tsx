import { ActivityIcon, CpuIcon, HardDriveIcon, MemoryStickIcon } from "lucide-react";
import SectionTitle from "@/components/SectionTitle";
import { formatBytes } from "@/lib/format";
import type { SystemMetrics as SystemMetricsData } from "@/utils/api/admin";
import MetricCard, { MetricSkeletons } from "@/components/MetricCard";

// "System" section: server status
export default function SystemMetrics({
  metrics,
  netRate,
}: {
  metrics: SystemMetricsData | null;
  netRate: { sent: number; recv: number };
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionTitle
        title="Système"
        description="État du serveur, actualisé toutes les 5 secondes."
      />
      <div className="grid grid-cols-4 gap-3">
        {metrics ? (
          <>
            <MetricCard
              Icon={CpuIcon}
              label="CPU"
              value={`${metrics.cpu_percent.toFixed(1)}%`}
              sub="/ 100%"
              percent={metrics.cpu_percent}
            />
            <MetricCard
              Icon={MemoryStickIcon}
              label="RAM"
              value={`${metrics.ram.used_gb.toFixed(1)} Go`}
              sub={`/ ${metrics.ram.total_gb.toFixed(1)} Go`}
              percent={metrics.ram.percent}
            />
            <MetricCard
              Icon={HardDriveIcon}
              label="Disque"
              value={`${metrics.disk.used_gb.toFixed(1)} Go`}
              sub={`${metrics.disk.free_gb.toFixed(1)} Go libre`}
              percent={metrics.disk.percent}
            />
            <MetricCard
              Icon={ActivityIcon}
              label="Réseau"
              value={`↑ ${formatBytes(netRate.sent)}/s`}
              sub={`↓ ${formatBytes(netRate.recv)}/s`}
            />
          </>
        ) : (
          <MetricSkeletons />
        )}
      </div>
    </div>
  );
}
