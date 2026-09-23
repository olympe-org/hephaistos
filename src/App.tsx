import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LoaderIcon } from "lucide-react";
import { Home, Login, NotFound } from "@/pages";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Layout from "@/components/Layout";
import { CHUNK_RELOAD_FLAG, lazyWithReload } from "@/utils/lazyWithReload";

// Home/Login/NotFound stay in the main bundle — they're the entry points a
// visitor (or a search engine) actually lands on. Everything past that point
// is the app proper and only needed once someone is using it, so it's split
// into its own chunk, downloaded on demand instead of upfront.
const CreateVideo = lazyWithReload(() => import("@/pages/CreateVideo"));
const UserPage = lazyWithReload(() => import("@/pages/UserPage"));
const Admin = lazyWithReload(() => import("@/pages/Admin"));
const RenderView = lazyWithReload(() => import("@/pages/RenderView"));

// Shown for the split second a lazy page's chunk is downloading, inside the
// normal app shell (navbar already visible via Layout).
function PageFallback() {
  return (
    <div className="flex min-h-[calc(100vh-var(--nav-h))] items-center justify-center">
      <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// RenderView renders outside Layout — mobile is a full-screen dark player,
// desktop/tablet a normal light-shell page, so match whichever one applies
// here too, avoiding a flash of the wrong background before its chunk loads.
function RenderViewFallback() {
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  if (isDesktop) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <LoaderIcon className="size-6 animate-spin text-white/70" />
    </div>
  );
}

export default function App() {
  // A prior mount may have auto-reloaded once to recover from a stale chunk
  // (see lazyWithReload) — getting this far means it worked, so clear the
  // guard and let a future, unrelated occurrence also get one clean retry.
  useEffect(() => {
    sessionStorage.removeItem(CHUNK_RELOAD_FLAG);
  }, []);

  return (
    <React.StrictMode>
      <Toaster
        position="top-right"
        offset={20}
        gap={10}
        expand
        toastOptions={{
          // Sonner injects its styles outside @layer, so we start from
          // scratch to let Tailwind utilities apply.
          unstyled: true,
          classNames: {
            toast:
              "flex w-[356px] items-start gap-3 rounded-2xl border border-border bg-background/95 p-4 font-sans text-sm text-foreground shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)] backdrop-blur-md",
            content: "flex min-w-0 flex-1 flex-col gap-0.5",
            title: "text-sm font-medium leading-snug",
            description: "text-xs leading-relaxed text-muted-foreground",
            icon: "mt-0.5 flex size-4 shrink-0 items-center justify-center [&>svg]:size-4",
            success: "[&_[data-icon]]:text-green-500",
            error: "[&_[data-icon]]:text-destructive",
            warning: "[&_[data-icon]]:text-amber-500",
            info: "[&_[data-icon]]:text-foreground",
            loading: "[&_[data-icon]]:text-muted-foreground",
            actionButton:
              "ml-auto h-7 shrink-0 self-center rounded-full bg-foreground px-3 text-xs font-medium text-background",
            cancelButton:
              "h-7 shrink-0 self-center rounded-full bg-muted px-3 text-xs font-medium text-foreground",
            closeButton:
              "absolute -top-2 -left-2 flex size-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground hover:text-foreground",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/create-video"
              element={
                <Suspense fallback={<PageFallback />}>
                  <CreateVideo />
                </Suspense>
              }
            />
            <Route element={<ProtectedRoute />}>
              <Route
                path="/user"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <UserPage />
                  </Suspense>
                }
              />
            </Route>
            <Route element={<AdminRoute />}>
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<PageFallback />}>
                    <Admin />
                  </Suspense>
                }
              />
            </Route>
            <Route
              path="*"
              element={<NotFound />}
            />
          </Route>
          <Route
            path="/render/:jobId"
            element={
              <Suspense fallback={<RenderViewFallback />}>
                <RenderView />
              </Suspense>
            }
          />
          {/* Share links now point here (branded vexia.studio URL) rather
              than straight at the API — RenderView builds the real API
              video URL itself from :jobId + ?token, same component either way. */}
          <Route
            path="/jobs/:jobId/download"
            element={
              <Suspense fallback={<RenderViewFallback />}>
                <RenderView />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
