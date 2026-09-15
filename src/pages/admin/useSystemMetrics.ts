import { useEffect, useRef, useState } from "react";
import { getSystemMetrics, type SystemMetrics } from "@/utils/api/admin";

const POLL_INTERVAL_MS = 5_000;

// Server metrics (CPU, RAM, disk) + network throughput, refreshed every 5 s
export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [netRate, setNetRate] = useState({ sent: 0, recv: 0 });
  const prevRef = useRef<{ data: SystemMetrics; time: number } | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await getSystemMetrics();
        const prev = prevRef.current;
        if (prev) {
          // Throughput = bytes exchanged since the previous measurement / elapsed time
          const dt = (Date.now() - prev.time) / 1000;
          setNetRate({
            sent: Math.max(
              0,
              (data.network.bytes_sent - prev.data.network.bytes_sent) / dt,
            ),
            recv: Math.max(
              0,
              (data.network.bytes_recv - prev.data.network.bytes_recv) / dt,
            ),
          });
        }
        prevRef.current = { data, time: Date.now() };
        setMetrics(data);
      } catch {
        // Server unreachable: keep displaying the last known values
      }
    };
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return { metrics, netRate };
}
