import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

// QR code linking to a render's mobile page (the token is passed in the URL)
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
  const token = localStorage.getItem("token") ?? "";
  const url = `${window.location.origin}/render/${jobId}?token=${token}`;

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
        <div className="m-auto flex w-fit items-center justify-center overflow-hidden rounded-xl bg-white p-4">
          <QRCodeSVG
            value={url}
            size={180}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
