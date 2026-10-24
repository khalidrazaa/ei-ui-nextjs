"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FormField from "@/components/common/FormField";
import { Textarea } from "@/components/ui/textarea";
import { ArticleComment } from "@/types/article";
import { formatDate } from "@/lib/format";

type CommentSectionProps = {
  slug: string;
};

export default function CommentSection({ slug }: CommentSectionProps) {
  // Reset pending requests and comment state when navigating to another article.
  return <ArticleComments key={slug} slug={slug} />;
}

function ArticleComments({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState<ArticleComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const postedComments = useRef<ArticleComment[]>([]);
  const submissionController = useRef<AbortController | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadComments() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`/article-comments?slug=${encodeURIComponent(slug)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok || !Array.isArray(data)) {
          throw new Error("Unable to load comments.");
        }
        if (controller.signal.aborted) return;

        // An older GET response must not erase a comment posted while it was loading.
        const postedIds = new Set(postedComments.current.map((comment) => comment.id));
        setComments([
          ...postedComments.current,
          ...(data as ArticleComment[]).filter((comment) => !postedIds.has(comment.id)),
        ]);
      } catch {
        if (!controller.signal.aborted) setLoadError("Unable to load comments. Please try again.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadComments();
    return () => controller.abort();
  }, [slug, loadAttempt]);

  useEffect(() => () => submissionController.current?.abort(), []);

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
    const controller = new AbortController();
    submissionController.current = controller;

    try {
      const response = await fetch("/article-comments", {
        method: "POST",
        signal: controller.signal,
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
      if (controller.signal.aborted) return;
      postedComments.current = [newComment, ...postedComments.current];
      setComments((current) => [newComment, ...current.filter((comment) => comment.id !== newComment.id)]);
      setContent("");
    } catch (submitError) {
      if (!controller.signal.aborted) {
        setError(submitError instanceof Error ? submitError.message : "Unable to post comment.");
      }
    } finally {
      if (!controller.signal.aborted) setIsSubmitting(false);
    }
  }

  return (
    <section className="flex flex-col gap-6" aria-labelledby="comments-title">
      <div>
        <h2 id="comments-title">Comments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          No login needed. Keep it thoughtful and respectful.
        </p>
      </div>

      <form className="flex flex-col gap-3" onSubmit={onSubmit}>
        <FormField id="comment-name" label="Name">
          <Input
            id="comment-name"
            className="bg-card"
            type="text"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Your name"
            minLength={2}
            maxLength={80}
            required
          />
        </FormField>
        <FormField id="comment-body" label="Comment">
          <Textarea
            id="comment-body"
            className="bg-card"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share your perspective"
            minLength={2}
            maxLength={2000}
            rows={4}
            required
          />
        </FormField>
        <Button type="submit" disabled={isDisabled} className="self-start">
          {isSubmitting ? "Posting…" : "Post comment"}
        </Button>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </form>

      {isLoading && (
        <p className="text-sm text-muted-foreground" role="status">Loading comments...</p>
      )}
      {loadError && (
        <div className="flex items-center gap-3">
          <p className="text-sm text-destructive" role="alert">{loadError}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
            Retry
          </Button>
        </div>
      )}
      {comments.length === 0 && !isLoading && !loadError && (
        <p className="text-sm text-muted-foreground">No comments yet. Start the conversation.</p>
      )}
      {comments.length > 0 && (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <li key={comment.id}>
              <article className="rounded-xl border border-border bg-card p-4">
                <header className="flex items-baseline justify-between gap-3">
                  <strong className="text-sm">{comment.author_name}</strong>
                  <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                </header>
                <p className="mt-2 whitespace-pre-line text-sm">{comment.content}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
