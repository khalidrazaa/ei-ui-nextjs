"use client";

import { FormEvent, useMemo, useState } from "react";

import { ArticleComment } from "@/types/article";
import { formatDate } from "@/lib/format";

type CommentSectionProps = {
  slug: string;
  initialComments: ArticleComment[];
};

export default function CommentSection({ slug, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<ArticleComment[]>(initialComments);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(() => {
    return isSubmitting || authorName.trim().length < 2 || content.trim().length < 2;
  }, [authorName, content, isSubmitting]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isDisabled) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          author_name: authorName.trim(),
          content: content.trim(),
        }),
      });

      const data = (await response.json()) as ArticleComment | { detail?: string };
      if (!response.ok) {
        const detail =
          typeof data === "object" && data !== null && "detail" in data && data.detail
            ? String(data.detail)
            : "Unable to post comment.";
        throw new Error(detail);
      }

      const newComment = data as ArticleComment;
      setComments((current) => [newComment, ...current]);
      setContent("");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to post comment.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="comment-wrap">
      <h2>Comments</h2>
      <p>No login needed. Keep it thoughtful and respectful.</p>

      <form className="comment-form" onSubmit={onSubmit}>
        <input
          type="text"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Your name"
          minLength={2}
          maxLength={80}
          required
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Share your perspective"
          minLength={2}
          maxLength={2000}
          rows={4}
          required
        />
        <button type="submit" disabled={isDisabled}>
          {isSubmitting ? "Posting..." : "Post comment"}
        </button>
        {error && <p className="comment-error">{error}</p>}
      </form>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="comment-empty">No comments yet. Start the conversation.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="comment-item">
              <header>
                <strong>{comment.author_name}</strong>
                <span>{formatDate(comment.created_at)}</span>
              </header>
              <p>{comment.content}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
