import { NextRequest, NextResponse } from "next/server";

import { createCommentForSlug, getCommentsForSlug } from "@/lib/articles";
import { ArticleComment } from "@/types/article";

export const dynamic = "force-dynamic";

const responseHeaders = { "Cache-Control": "no-store" };

function isComment(value: unknown): value is ArticleComment {
  if (!value || typeof value !== "object") return false;
  const comment = value as Record<string, unknown>;
  return typeof comment.id === "number" &&
    typeof comment.author_name === "string" &&
    typeof comment.content === "string" &&
    typeof comment.created_at === "string";
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ detail: "slug is required" }, { status: 400, headers: responseHeaders });
  }

  try {
    const comments = await getCommentsForSlug(slug);
    if (!Array.isArray(comments) || !comments.every(isComment)) {
      throw new Error("Invalid comment response");
    }
    return NextResponse.json(comments, { status: 200, headers: responseHeaders });
  } catch {
    return NextResponse.json({ detail: "Unable to load comments" }, { status: 500, headers: responseHeaders });
  }
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid JSON" }, { status: 400, headers: responseHeaders });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ detail: "Invalid comment" }, { status: 400, headers: responseHeaders });
  }

  const fields = payload as Record<string, unknown>;
  const slug = typeof fields.slug === "string" ? fields.slug.trim() : "";
  const authorName = typeof fields.author_name === "string" ? fields.author_name.trim() : "";
  const content = typeof fields.content === "string" ? fields.content.trim() : "";

  if (!slug || authorName.length < 2 || authorName.length > 80 || content.length < 2 || content.length > 2000) {
    return NextResponse.json(
      { detail: "slug, author_name (2-80 characters), and content (2-2000 characters) are required" },
      { status: 400, headers: responseHeaders }
    );
  }

  try {
    const comment = await createCommentForSlug(slug, { author_name: authorName, content });
    if (!isComment(comment)) throw new Error("Invalid comment response");
    return NextResponse.json(comment, { status: 201, headers: responseHeaders });
  } catch {
    return NextResponse.json({ detail: "Unable to create comment" }, { status: 500, headers: responseHeaders });
  }
}
