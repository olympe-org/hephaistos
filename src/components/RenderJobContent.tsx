import { useState } from "react";
import { useAppSelector } from "@/store";
import { QRCodeSVG } from "qrcode.react";
import RenderProgress from "./RenderProgress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function RenderJobContent({ showMeta }: { showMeta?: boolean }) {
  const job = useAppSelector((s) => s.render.job);
  const [qrOpen, setQrOpen] = useState(false);

  if (!job) return null;

  const token = localStorage.getItem("token") ?? "";
  const qrUrl = `${window.location.origin}/render/${job.job_id}?token=${token}`;

  return (
    <div className="flex flex-col gap-6">

      {showMeta && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Rendu</span>
          <span className="text-base font-semibold tracking-tight">{job.title}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(job.created_at).toLocaleString("fr-FR", {
              dateStyle: "long",
              timeStyle: "short",
            })}
          </span>
        </div>
      )}

      <RenderProgress />

      {job.status === "done" && job.job_id && (
        <>
          <div className="flex items-center gap-5 rounded-2xl border border-border bg-muted/30 p-5">
            {/* Le QR s'ouvre en grand au clic */}
            <button
              type="button"
              aria-label="Agrandir le QR code"
              onClick={() => setQrOpen(true)}
              className="shrink-0 cursor-zoom-in overflow-hidden rounded-xl bg-white p-3 shadow-sm outline-none transition-[transform,box-shadow] hover:scale-[1.03] hover:shadow-md focus-visible:ring-3 focus-visible:ring-violet-400/30"
            >
              <QRCodeSVG value={qrUrl} size={112} />
            </button>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold">Sur ton téléphone</span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Scanne le QR code pour ouvrir la vidéo, la regarder en plein écran
                et la télécharger.
              </p>
              <span className="text-xs text-muted-foreground/70">
                Clique dessus pour l'agrandir.
              </span>
            </div>
          </div>

          <Dialog open={qrOpen} onOpenChange={setQrOpen}>
            <DialogContent className="max-w-xs rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  QR code
                </DialogTitle>
                <DialogDescription className="truncate">{job.title}</DialogDescription>
              </DialogHeader>
              <div className="m-auto flex w-fit items-center justify-center overflow-hidden rounded-xl bg-white p-4">
                <QRCodeSVG value={qrUrl} size={200} />
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}

    </div>
  );
}
