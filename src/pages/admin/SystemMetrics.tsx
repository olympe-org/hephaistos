import { ActivityIcon, CpuIcon, HardDriveIcon, MemoryStickIcon } from "lucide-react";
import CarouselRow, { CAROUSEL_ITEM } from "@/components/CarouselRow";
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
      <div className="px-6 lg:px-0">
        <SectionTitle
          title="Système"
          description="État du serveur, actualisé toutes les 5 secondes."
        />
      </div>
      <CarouselRow gridClassName="lg:grid-cols-2 min-[1220px]:grid-cols-4!">
        {metrics ? (
          <>
            <MetricCard
              Icon={CpuIcon}
              label="CPU"
              value={`${metrics.cpu_percent.toFixed(1)}%`}
              sub="/ 100%"
              percent={metrics.cpu_percent}
              className={CAROUSEL_ITEM}
            />
            <MetricCard
              Icon={MemoryStickIcon}
              label="RAM"
              value={`${metrics.ram.used_gb.toFixed(1)} Go`}
              sub={`/ ${metrics.ram.total_gb.toFixed(1)} Go`}
              percent={metrics.ram.percent}
              className={CAROUSEL_ITEM}
            />
            <MetricCard
              Icon={HardDriveIcon}
              label="Disque"
              value={`${metrics.disk.used_gb.toFixed(1)} Go`}
              sub={`${metrics.disk.free_gb.toFixed(1)} Go libre`}
              percent={metrics.disk.percent}
              className={CAROUSEL_ITEM}
            />
            <MetricCard
              Icon={ActivityIcon}
              label="Réseau"
              value={`↑ ${formatBytes(netRate.sent)}/s`}
              sub={`↓ ${formatBytes(netRate.recv)}/s`}
              className={CAROUSEL_ITEM}
            />
          </>
        ) : (
          <MetricSkeletons className={CAROUSEL_ITEM} />
        )}
      </CarouselRow>
    </div>
  );
}
