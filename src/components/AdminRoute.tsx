import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, setUserData } from "@/store/authSlice";
import { verifyToken, getMe } from "@/utils/api/auth";

// Result of the server-side check; without a token, access is denied without
// even needing to call the server (derived directly at render time, below).
type RemoteStatus = "checking" | "valid" | "forbidden";

export default function AdminRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const isAdmin = useAppSelector((s) => s.auth.isAdmin);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>("checking");

  useEffect(() => {
    if (!token) return; // no token: the "invalid" status is derived below

    const controller = new AbortController();

    verifyToken(token, controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      if (result === "invalid") {
        dispatch(logout());
        // the token goes back to null on the next render → "invalid" status derived
        return;
      }

      try {
        const me = await getMe(token);
        if (controller.signal.aborted) return;
        dispatch(
          setUserData({
            username: me.username,
            isAdmin: me.is_admin,
            features: me.features,
            maxJobs: me.max_jobs,
          }),
        );
        setRemoteStatus(me.is_admin ? "valid" : "forbidden");
      } catch {
        setRemoteStatus(isAdmin ? "valid" : "forbidden");
      }
    });

    return () => controller.abort();
  }, [token, dispatch, isAdmin]);

  const status = token ? remoteStatus : "invalid";

  if (status === "checking") return null;
  if (status === "invalid") return <Navigate to="/login" replace />;
  if (status === "forbidden") return <Navigate to="/" replace />;

  return <Outlet />;
}
