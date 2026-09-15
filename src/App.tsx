import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Home, Login, CreateVideo, UserPage, RenderView, Admin } from "@/pages";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Layout from "@/components/Layout";

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
            <Route path="/create-video" element={<CreateVideo />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/user" element={<UserPage />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
            </Route>
          </Route>
          <Route path="/render/:jobId" element={<RenderView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}
