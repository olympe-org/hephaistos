import Home from "./Home";
import Login from "./Login";
import NotFound from "./NotFound";

// Admin/CreateVideo/RenderView/UserPage are intentionally left out of this
// barrel: App.tsx imports them directly (`@/pages/Admin`, …) so they can be
// code-split with `React.lazy` — importing them here would pull them back
// into the main bundle regardless.
export { Home, Login, NotFound };
