import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

/** Element styles for assistant markdown (no typography plugin — explicit map). */
const COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="leading-relaxed break-words">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="mt-4 mb-2 text-lg font-semibold first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-4 mb-2 text-base font-semibold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-3 mb-1.5 text-sm font-semibold first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="my-2 ml-5 list-disc space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 ml-5 list-decimal space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-primary font-medium break-words underline underline-offset-2"
    >
      {children}
    </a>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  code: ({ className, children }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className="bg-muted block max-w-full overflow-x-auto rounded-lg p-3 font-mono text-xs">
          {children}
        </code>
      );
    }
    return (
      <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-[0.85em] break-words">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="my-2">{children}</pre>,
  blockquote: ({ children }) => (
    <blockquote className="border-border text-muted-foreground my-2 border-l-2 pl-3">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-border border px-3 py-1.5 text-left font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-border border px-3 py-1.5">{children}</td>
  ),
};

interface MarkdownProps {
  content: string;
  className?: string;
}

/** Renders assistant text as GitHub-flavoured markdown. */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div className={cn("min-w-0 space-y-2 text-sm break-words", className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
