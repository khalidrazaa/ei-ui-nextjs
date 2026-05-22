import { NextRequest, NextResponse } from "next/server";

import { createCommentForSlug, getCommentsForSlug } from "@/lib/articles";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ detail: "slug is required" }, { status: 400 });
  }

  try {
    const comments = await getCommentsForSlug(slug);
    return NextResponse.json(comments, { status: 200 });
  } catch {
    return NextResponse.json({ detail: "Unable to load comments" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      slug?: string;
      author_name?: string;
      content?: string;
    };

    const slug = String(payload.slug || "").trim();
    const authorName = String(payload.author_name || "").trim();
    const content = String(payload.content || "").trim();

    if (!slug || authorName.length < 2 || content.length < 2) {
      return NextResponse.json(
        { detail: "slug, author_name, and content are required" },
        { status: 400 }
      );
    }

    const comment = await createCommentForSlug(slug, {
      author_name: authorName,
      content,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ detail: "Unable to create comment" }, { status: 500 });
  }
}
