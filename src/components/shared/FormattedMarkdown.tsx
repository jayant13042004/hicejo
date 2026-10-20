"use client";

import * as React from "react";
import Link from "next/link";

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

// Parses inline Markdown: links [text](url), bold **text**, code `text`, italic *text*
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const tokenRegex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      nodes.push(text.substring(lastIdx, match.index));
    }

    if (match[2] && match[3]) {
      // Link [label](url)
      const label = match[2];
      const url = match[3];
      const isInternal = url.startsWith("/");
      if (isInternal) {
        nodes.push(
          <Link
            key={`link-${match.index}`}
            href={url}
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline px-2 py-0.5 my-0.5 rounded-md bg-primary/10 border border-primary/20 transition-colors"
          >
            <span>{label}</span>
          </Link>
        );
      } else {
        nodes.push(
          <a
            key={`link-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-primary hover:underline px-2 py-0.5 my-0.5 rounded-md bg-primary/10 border border-primary/20 transition-colors"
          >
            <span>{label}</span>
          </a>
        );
      }
    } else if (match[4] || match[5]) {
      // Bold **text** or __text__
      const boldText = match[4] || match[5];
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-bold text-foreground">
          {boldText}
        </strong>
      );
    } else if (match[6]) {
      // Inline code `text`
      nodes.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-xs border border-border/50"
        >
          {match[6]}
        </code>
      );
    } else if (match[7]) {
      // Italic *text*
      nodes.push(
        <em key={`italic-${match.index}`} className="italic">
          {match[7]}
        </em>
      );
    }

    lastIdx = tokenRegex.lastIndex;
  }

  if (lastIdx < text.length) {
    nodes.push(text.substring(lastIdx));
  }

  return nodes.length > 0 ? nodes : [text];
}

export function FormattedMarkdown({ content, className = "" }: FormattedMarkdownProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: { type: "ul" | "ol"; items: React.ReactNode[] } | null = null;

  const flushList = () => {
    if (currentList) {
      if (currentList.type === "ul") {
        blocks.push(
          <ul key={`ul-${blocks.length}`} className="my-2 space-y-1.5 pl-5 list-disc text-foreground/90">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      } else {
        blocks.push(
          <ol key={`ol-${blocks.length}`} className="my-2 space-y-1.5 pl-5 list-decimal text-foreground/90">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Horizontal Rule: *** or --- or ___
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      blocks.push(<hr key={`hr-${i}`} className="my-3 border-border/50" />);
      continue;
    }

    // Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      if (level <= 2) {
        blocks.push(
          <h3 key={`h-${i}`} className="text-sm font-bold text-foreground mt-3 mb-1.5">
            {parseInlineMarkdown(headingText)}
          </h3>
        );
      } else {
        blocks.push(
          <h4 key={`h-${i}`} className="text-xs font-bold uppercase tracking-wider text-primary mt-2.5 mb-1">
            {parseInlineMarkdown(headingText)}
          </h4>
        );
      }
      continue;
    }

    // Unordered List item: * item or - item or • item
    const ulMatch = trimmed.match(/^[\*\-•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== "ul") {
        flushList();
        currentList = { type: "ul", items: [] };
      }
      currentList.items.push(parseInlineMarkdown(ulMatch[1]));
      continue;
    }

    // Ordered List item: 1. item, 2. item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== "ol") {
        flushList();
        currentList = { type: "ol", items: [] };
      }
      currentList.items.push(parseInlineMarkdown(olMatch[2]));
      continue;
    }

    // Empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Normal paragraph line
    flushList();
    blocks.push(
      <p key={`p-${i}`} className="my-1.5 leading-relaxed text-foreground/90">
        {parseInlineMarkdown(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 text-xs ${className}`}>{blocks}</div>;
}
