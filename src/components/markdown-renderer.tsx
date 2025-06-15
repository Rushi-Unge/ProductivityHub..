
"use client"

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-sm dark:prose-invert max-w-none leading-normal", className)} // Added prose-sm and leading-normal
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-lg font-semibold my-2 font-headline" {...props} />, // Adjusted sizes
        h2: ({node, ...props}) => <h2 className="text-base font-semibold my-1.5 font-headline" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-sm font-semibold my-1 font-headline" {...props} />,
        p: ({node, ...props}) => <p className="my-1" {...props} />, // Reduced margins
        ul: ({node, ...props}) => <ul className="my-1 pl-4 space-y-0.5" {...props} />, // Reduced margins & spacing
        ol: ({node, ...props}) => <ol className="my-1 pl-4 space-y-0.5" {...props} />,
        li: ({node, children, ...props}) => {
          const taskListItem = React.Children.toArray(children).some(child => 
            React.isValidElement(child) && (child.type as any) === 'input' && child.props.type === 'checkbox'
          );
          return <li className={cn(props.className, taskListItem ? "list-none flex items-start gap-1.5 ml-[-1rem]" : "my-0.5")} {...props}>{children}</li>; // Reduced spacing for task list
        },
        input: ({node, type, checked, disabled, ...props}) => {
           if(type === 'checkbox') {
               return <input type="checkbox" checked={checked as boolean | undefined} disabled={disabled} readOnly className="form-checkbox h-3.5 w-3.5 text-primary rounded border-muted-foreground/50 mt-0.5 cursor-default focus:ring-0 focus:ring-offset-0" {...props}/> // smaller checkbox
           }
           return <input type={type as string} {...props} />
        },
        code: ({node, inline, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <pre className={cn(className, "rounded-md bg-muted/50 p-2 my-1.5 overflow-x-auto text-xs")} {...props}> {/* Smaller padding/font for pre */}
              <code className="text-foreground/90 bg-transparent">{children}</code>
            </pre>
          ) : (
            <code className={cn(className, "bg-muted/50 text-primary px-1 py-0.5 rounded-sm text-[0.8em]")} {...props}> {/* Smaller inline code */}
              {children}
            </code>
          )
        },
        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/50 pl-2 italic text-muted-foreground my-1.5 text-xs" {...props} />, // Thinner border, smaller
        hr: ({node, ...props}) => <hr className="border-border my-2" {...props} />, // Reduced margin
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

