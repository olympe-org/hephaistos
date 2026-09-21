import { useEffect, useState } from "react";
import { CheckIcon, CopyIcon, LoaderIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useAppSelector } from "@/store";
import { getShareLink } from "@/utils/api/render";
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
  const [copied, setCopied] = useState(false);
  // Share link fetched once the render is done, reused by both the QR code
  // and the "copy link" row below — no need to ask the backend for it twice.
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    if (job?.status === "done" && job.job_id) {
      getShareLink(job.job_id)
        .then(({ url }) => setShareUrl(url))
        .catch(() => setShareUrl(null));
    }
  }, [job?.status, job?.job_id]);

  if (!job) return null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/30 p-5">
          {/* Click to open the QR code full-size */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Agrandir le QR code"
              onClick={() => setQrOpen(true)}
              disabled={!shareUrl}
              className="flex size-28 shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded-xl bg-white p-3 shadow-sm outline-none transition-[transform,box-shadow] hover:scale-[1.03] hover:shadow-md focus-visible:ring-3 focus-visible:ring-violet-400/30 disabled:cursor-default"
            >
              {shareUrl ? (
                <QRCodeSVG
                  value={shareUrl}
                  size={112}
                />
              ) : (
                <LoaderIcon className="size-5 animate-spin text-muted-foreground/60" />
              )}
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

          {/* Same "copy" interaction as the contact e-mail on the login page */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!shareUrl}
            className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-60"
          >
            <span className="truncate font-mono text-xs text-muted-foreground">
              {shareUrl ?? "Génération du lien…"}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
              {copied ? (
                <>
                  <CheckIcon className="size-3.5 text-green-500" />
                  <span className="font-medium text-green-500">Copié</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-3.5" />
                  <span className="font-medium">Copier le lien</span>
                </>
              )}
            </span>
          </button>
        </div>
      )}

      <Dialog
        open={qrOpen}
        onOpenChange={setQrOpen}
      >
        <DialogContent className="max-w-xs rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight">
              QR code
            </DialogTitle>
            <DialogDescription className="truncate">{job.title}</DialogDescription>
          </DialogHeader>
          <div className="m-auto flex w-fit items-center justify-center overflow-hidden rounded-xl bg-white p-4">
            {shareUrl && (
              <QRCodeSVG
                value={shareUrl}
                size={200}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
