import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "@/store";
import { getPublicMetrics, type PublicMetrics } from "@/utils/api/render";
import HeroSection, { type ApiStatus } from "./home/HeroSection";
import MetricsSection from "./home/MetricsSection";
import WorkflowSection from "./home/WorkflowSection";
import FeaturesSection from "./home/FeaturesSection";
import CtaSection from "./home/CtaSection";
import Footer from "./home/Footer";

// Marketing landing page: each section lives in ./home/
export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = useAppSelector((s) => !!s.auth.token);
  const [metrics, setMetrics] = useState<PublicMetrics | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  // The public metrics also serve as a backend availability check
  useEffect(() => {
    getPublicMetrics()
      .then((m) => {
        setMetrics(m);
        setApiStatus("up");
      })
      .catch(() => setApiStatus("down"));
  }, []);

  const goToApp = () => navigate(isLoggedIn ? "/create-video" : "/login");

  return (
    <div className="min-h-[calc(100vh-var(--nav-h))] bg-background">
      <HeroSection
        apiStatus={apiStatus}
        isLoggedIn={isLoggedIn}
        onStart={goToApp}
      />
      <MetricsSection metrics={metrics} />
      <WorkflowSection />
      <FeaturesSection />
      <CtaSection
        isLoggedIn={isLoggedIn}
        onStart={goToApp}
      />
      <Footer />
    </div>
  );
}
