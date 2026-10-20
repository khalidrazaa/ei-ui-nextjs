import { siteConfig } from "@/config/site";

export function articleUrl(slug: string): string {
  return `https://${siteConfig.domain}/articles/${slug}`;
}

export type ShareTarget = "linkedin" | "x";

/** Share intents for each network. */
export function shareHref(target: ShareTarget, url: string, title: string): string {
  const encodedUrl = encodeURIComponent(url);

  switch (target) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "x":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(title)}`;
  }
}
