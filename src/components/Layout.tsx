import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import MobileGuard from "./MobileGuard";
import TokenPolling from "./TokenPolling";
import { useAppSelector } from "@/store";
import { useRenderNotifier } from "@/hooks/useRenderNotifier";
import { Button } from "./ui/button";

// Pages where the navbar stays fixed at full width (no floating pill on scroll)
const STATIC_NAVBAR_ROUTES = ["/create-video"];

export default function Layout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  useRenderNotifier();
  const showBanner = !token && pathname === "/create-video";
  const detachable = !STATIC_NAVBAR_ROUTES.includes(pathname);

  const [bannerMounted, setBannerMounted] = useState(showBanner);
  const [bannerIn, setBannerIn] = useState(false);

  // Animates the banner in/out: mount it, then (on the next tick) trigger the
  // CSS transition; when closing, start the transition then unmount once it's
  // done. Both setState calls are deferred by a tick (instead of being
  // synchronous) to stay outside of render.
  useEffect(() => {
    if (showBanner) {
      const mount = setTimeout(() => setBannerMounted(true), 0);
      const slideIn = setTimeout(() => setBannerIn(true), 30);
      return () => {
        clearTimeout(mount);
        clearTimeout(slideIn);
      };
    } else {
      const slideOut = setTimeout(() => setBannerIn(false), 0);
      const unmount = setTimeout(() => setBannerMounted(false), 320);
      return () => {
        clearTimeout(slideOut);
        clearTimeout(unmount);
      };
    }
  }, [showBanner]);

  return (
    <>
      {token && <TokenPolling />}
      {bannerMounted && (
        <div
          className={`fixed inset-x-0 top-0 z-50 flex h-10 items-center justify-center gap-3 bg-foreground px-4 text-background transition-transform duration-300 ease-out ${
            bannerIn ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-violet-400" />
          <span className="hidden text-xs font-medium sm:inline">
            Tu explores en invité — connecte-toi pour lancer un rendu.
          </span>
          <span className="text-xs font-medium sm:hidden">
            Connecte-toi pour lancer un rendu.
          </span>
          <Button
            size="sm"
            className="h-6 shrink-0 rounded-full bg-background px-3 text-[11px] font-semibold text-foreground hover:bg-background/90"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </Button>
        </div>
      )}
      {/* Only the editor needs real screen space — every other page has its
          own mobile layout. */}
      {pathname === "/create-video" && <MobileGuard />}
      <Navbar
        showBanner={showBanner}
        bannerIn={bannerIn}
        detachable={detachable}
      />
      <div
        className="transition-[padding-top] duration-300 ease-out"
        style={{
          paddingTop:
            showBanner && bannerIn
              ? "calc(var(--nav-h) + 2.5rem)"
              : "var(--nav-h)",
        }}
      >
        <Outlet />
      </div>
    </>
  );
}
