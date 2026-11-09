/** Media stays external to the article build. Never inline uploaded SVG or HTML. */
export function safeImageSrc(value: string): string | undefined {
  const source = value.trim();
  if (!source || /[\\\u0000-\u001f\u007f]/.test(source)) return undefined;
  if (/^\/(?!\/)/.test(source)) return source;
  if (!/^https?:\/\//i.test(source)) return undefined;
  try {
    const url = new URL(source);
    return url.hostname && (url.protocol === "http:" || url.protocol === "https:") ? url.href : undefined;
  } catch {
    return undefined;
  }
}

type ArticleImageProps = {
  src: string;
  alt: string;
  title?: string;
  /** Inline images must not introduce a figure inside a paragraph/list/table. */
  inline?: boolean;
};

export default function ArticleImage({ src, alt, title, inline = false }: ArticleImageProps) {
  const source = safeImageSrc(src);
  if (!source) return <span>{alt}</span>;
  const image = (
    // Uploaded media has a stable URL; preserve full diagram proportions without an image proxy.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={source} alt={alt} title={title} loading="lazy" decoding="async" className="article-image" />
  );
  if (inline) return image;
  return (
    <figure>
      <a href={source} target="_blank" rel="noopener noreferrer" aria-label={alt ? `Open full-size image: ${alt}` : "Open full-size image"}>
        {image}
      </a>
      {title && <figcaption>{title}</figcaption>}
    </figure>
  );
}
