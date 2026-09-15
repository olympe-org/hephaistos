import { useEffect } from "react";

const SITE_URL = "https://vexia.studio";

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(path: string) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", `${SITE_URL}${path}`);
}

// This app is a single-page app served from one index.html, so without this
// every route would share the exact same tab title, meta description and
// canonical URL — bad for SEO (duplicate metadata) and for usability (the
// browser tab/history never reflects which page you're on).
export function usePageMeta({
  title,
  description,
  path,
  indexable = true,
}: {
  title: string;
  description?: string;
  path: string;
  // false for private/app screens that have no place in search results
  // (account, admin, a render's share link) — kept in sync with robots.txt.
  indexable?: boolean;
}) {
  useEffect(() => {
    document.title = title;
    if (description) setMetaTag("name", "description", description);
    setMetaTag("name", "robots", indexable ? "index, follow" : "noindex, nofollow");
    setCanonical(path);
  }, [title, description, path, indexable]);
}
