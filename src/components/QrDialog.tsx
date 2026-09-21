import { useEffect, useState } from "react";
import { LoaderIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getShareLink } from "@/utils/api/render";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// QR code linking to a render's mobile page — the link is a short-lived
// (~48h) share link fetched from the backend, not the user's own auth token.
export default function QrDialog({
  open,
  onClose,
  jobId,
  title,
}: {
  open: boolean;
  onClose: () => void;
  jobId: string;
  title: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !jobId) return;
    let cancelled = false;
    getShareLink(jobId)
      .then((link) => {
        if (!cancelled) setUrl(link.url);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [open, jobId]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
    >
      <DialogContent className="max-w-xs rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold tracking-tight">
            QR code
          </DialogTitle>
          <DialogDescription className="truncate">{title}</DialogDescription>
        </DialogHeader>
        <div className="m-auto flex size-[212px] items-center justify-center overflow-hidden rounded-xl bg-white p-4">
          {url ? (
            <QRCodeSVG
              value={url}
              size={180}
            />
          ) : (
            <LoaderIcon className="size-5 animate-spin text-muted-foreground/60" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
