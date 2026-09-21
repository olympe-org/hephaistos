import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LoaderIcon } from "lucide-react";
import { Home, Login, NotFound } from "@/pages";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Layout from "@/components/Layout";

// Home/Login/NotFound stay in the main bundle — they're the entry points a
// visitor (or a search engine) actually lands on. Everything past that point
// is the app proper and only needed once someone is using it, so it's split
// into its own chunk, downloaded on demand instead of upfront.
const CreateVideo = lazy(() => import("@/pages/CreateVideo"));
const UserPage = lazy(() => import("@/pages/UserPage"));
const Admin = lazy(() => import("@/pages/Admin"));
const RenderView = lazy(() => import("@/pages/RenderView"));

// Shown for the split second a lazy page's chunk is downloading, inside the
// normal app shell (navbar already visible via Layout).
function PageFallback() {
  return (
    <div className="flex min-h-[calc(100vh-var(--nav-h))] items-center justify-center">
      <LoaderIcon className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

// RenderView renders outside Layout, full-screen and dark — match that here
// so there's no flash of the light app shell before its chunk loads.
function RenderViewFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black">
      <LoaderIcon className="size-6 animate-spin text-white/70" />
    </div>
  );
}

export default function App() {
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
