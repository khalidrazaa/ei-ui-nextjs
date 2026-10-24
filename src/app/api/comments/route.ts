// Compatibility endpoint for clients that reach Next.js directly. The browser uses
// /article-comments because production proxies route /api/ requests to FastAPI.
export { GET, POST } from "@/app/article-comments/route";

export const dynamic = "force-dynamic";
