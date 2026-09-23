import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LoaderIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  CopyIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store";
import { loginSuccess, setUserData } from "@/store/authSlice";
import { login, getMe } from "@/utils/api/auth";

const CONTACT_EMAIL = "ringressi.anthony@gmail.com";

export default function LoginCard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { access_token } = await login(username, password);
      dispatch(loginSuccess({ token: access_token, username }));
      const me = await getMe(access_token);
      dispatch(setUserData({ username: me.username, isAdmin: me.is_admin, features: me.features, maxJobs: me.max_jobs }));
      navigate("/user");
    } catch (err: unknown) {
      const detail = (err as { detail?: { detail?: string; message?: string } })?.detail;
      const msg = detail?.detail ?? detail?.message ?? "Identifiants incorrects.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyEmail = async () => {
    await navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
      {/* Back to home — the two-column layout already gives desktop a way
          out, so this is mobile-only */}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Retour à l'accueil"
        className="inline-flex size-9 items-center justify-center self-start rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background lg:hidden"
      >
        <ArrowLeftIcon className="size-3.5" />
      </button>

      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
          Connexion
        </h1>
        <p className="text-sm text-muted-foreground">
          Entre tes identifiants pour accéder à l'application.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            type="text"
            placeholder="monnom"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="h-11 rounded-xl bg-background px-3.5"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-11 rounded-xl bg-background px-3.5 pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          className="mt-1 h-11 rounded-full text-[15px]"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderIcon className="size-4 animate-spin" />
              Connexion…
            </>
          ) : (
            <>
              Se connecter
              <ArrowRightIcon className="size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Create account */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-5">
        <p className="text-sm font-medium">Pas encore de compte&nbsp;?</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          L'accès à Vexia Studio est sur invitation. Pour demander un compte,
          écris-moi directement.
        </p>
        <button
          type="button"
          onClick={handleCopyEmail}
          className="group flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/70"
        >
          <span className="min-w-0 truncate font-medium">{CONTACT_EMAIL}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
            {copied ? (
              <>
                <CheckIcon className="size-3.5 text-green-500" />
                <span className="font-medium text-green-500">Copié</span>
              </>
            ) : (
              <>
                <CopyIcon className="size-3.5" />
                Copier
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
