import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, setUserData } from "@/store/authSlice";
import { verifyToken, getMe } from "@/utils/api/auth";

// Without a token, access is denied without calling the server (derived at render time, below).
type RemoteStatus = "checking" | "valid";

export default function ProtectedRoute() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus>("checking");

  useEffect(() => {
    if (!token) return; // no token: the "invalid" status is derived below

    const controller = new AbortController();

    verifyToken(token, controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;

      if (result === "valid" || result === "error") {
        if (result === "valid") {
          getMe(token)
            .then((me) => {
              if (!controller.signal.aborted) {
                dispatch(
                  setUserData({
                    username: me.username,
                    isAdmin: me.is_admin,
                    features: me.features,
                    maxJobs: me.max_jobs,
                  }),
                );
              }
            })
            .catch(() => {});
        }
        setRemoteStatus("valid");
      } else {
        dispatch(logout());
        // the token goes back to null on the next render → "invalid" status derived
      }
    });

    return () => controller.abort();
  }, [token, dispatch]);

  const status = token ? remoteStatus : "invalid";

  if (status === "checking") return null;
  if (status === "invalid") return <Navigate to="/login" replace />;

  return <Outlet />;
}
