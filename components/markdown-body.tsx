"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidBlock } from "./mermaid-block";

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const text = String(children ?? "").replace(/\n$/, "");
  const lang = className?.replace("language-", "") ?? "";
  if (lang === "mermaid") return <MermaidBlock chart={text} />;
  return (
    <pre>
      <code className={className}>{text}</code>
    </pre>
  );
}

const components: Components = {
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children, ...props }) {
    const isBlock = Boolean(className) || String(children).includes("\n");
    if (isBlock) return <CodeBlock className={className}>{children}</CodeBlock>;
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  img({ src, alt }) {
    if (!src) return null;
    return <img src={src} alt={alt ?? ""} loading="lazy" />;
  },
};

export function MarkdownBody({ source }: { source: string }) {
  return (
    <div className="prose-blog">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
