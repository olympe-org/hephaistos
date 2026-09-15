import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { MoonIcon, SunIcon, UserIcon } from "lucide-react";
import { useAppSelector } from "@/store";
import { useTheme } from "@/utils/useTheme";

const SCROLL_THRESHOLD = 60;
const ENTER = "animate-in fade-in duration-500 delay-200 fill-mode-both";

export default function Navbar({
  showBanner = false,
  bannerIn = false,
  detachable = true,
}: {
  showBanner?: boolean;
  bannerIn?: boolean;
  detachable?: boolean;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = useAppSelector((s) => s.auth.token);
  const isAdmin = useAppSelector((s) => s.auth.isAdmin);
  const username = useAppSelector((s) => s.auth.username);
  const { isDark, toggle } = useTheme();

  const [scrolled, setScrolled] = useState(
    () => window.scrollY > SCROLL_THRESHOLD,
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const floating = detachable && scrolled;
  const bannerOffset = showBanner && bannerIn;

  const handleLogoClick = (e: React.MouseEvent) => {
    if (location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 ${
      isActive
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
    }`;

  return (
    <header
      className={`fixed z-40 flex items-center transition-all duration-450 ease-in-out ${
        floating
          ? "inset-x-3 top-3 h-16 rounded-[32px] border border-border/70 bg-background/75 px-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:inset-x-[6%] lg:inset-x-[12%] lg:px-5 xl:inset-x-[18%]"
          : `${bannerOffset ? "top-10" : "top-0"} inset-x-0 h-(--nav-h) rounded-none border border-transparent bg-transparent px-6 lg:px-10`
      }`}
    >
      {/* Logo */}
      <NavLink
        to="/"
        onClick={handleLogoClick}
        className={`flex shrink-0 items-center gap-1.5 ${ENTER}`}
      >
        <span className="text-base font-black text-foreground uppercase tracking-tight leading-none transition-colors duration-300">
          Vexia
        </span>
        <span className="mb-2 size-1.5 shrink-0 rounded-full bg-violet-400" />
      </NavLink>

      {/* Nav links */}
      <nav className={`ml-8 hidden items-center gap-2 lg:flex ${ENTER}`}>
        <NavLink
          to="/"
          end
          className={linkClass}
        >
          Accueil
        </NavLink>
        <NavLink
          to="/create-video"
          className={linkClass}
        >
          Créer
        </NavLink>
        {isAdmin && (
          <NavLink
            to="/admin"
            className={linkClass}
          >
            Admin
          </NavLink>
        )}
      </nav>

      {/* Actions */}
      <div className={`ml-auto flex items-center gap-2 ${ENTER}`}>
        {token ? (
          <button
            type="button"
            onClick={() => navigate("/user")}
            className={`hidden h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-colors duration-300 lg:inline-flex ${
              location.pathname === "/user"
                ? "border-foreground/20 bg-muted text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
            }`}
          >
            <UserIcon className="size-3.5" />
            {username}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex h-9 items-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity duration-300 hover:opacity-85"
          >
            Se connecter
          </button>
        )}
        <button
          type="button"
          onClick={toggle}
          aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
          className="inline-flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-300 hover:border-foreground hover:bg-foreground hover:text-background"
        >
          {isDark ? (
            <SunIcon className="size-3.5" />
          ) : (
            <MoonIcon className="size-3.5" />
          )}
        </button>
      </div>
    </header>
  );
}
