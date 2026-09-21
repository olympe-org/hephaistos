import { toast } from "sonner";
import { getShareLink } from "@/utils/api/render";

// Fetches a fresh share link for a render and copies it to the clipboard —
// used by the "Partager" action wherever a render is listed (admin/user rows).
export async function copyShareLink(jobId: string): Promise<void> {
  const { url } = await getShareLink(jobId);
  await navigator.clipboard.writeText(url);
  toast.success("Lien copié !");
}
