
"use client"

import * as React from 'react'; // Added this line
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, strikethrough, etc.)
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn("prose dark:prose-invert max-w-none", className)}
      remarkPlugins={[remarkGfm]}
      components={{
        // Customize heading styles to better match Tailwind typography if needed
        h1: ({node, ...props}) => <h1 className="text-xl font-bold my-3 font-headline" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-lg font-semibold my-2 font-headline" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-md font-semibold my-1 font-headline" {...props} />,
        p: ({node, ...props}) => <p className="my-1.5 leading-relaxed" {...props} />,
        ul: ({node, ...props}) => <ul className="my-1.5 pl-5 space-y-0.5" {...props} />,
        ol: ({node, ...props}) => <ol className="my-1.5 pl-5 space-y-0.5" {...props} />,
        li: ({node, children, ...props}) => {
          // Check if this li is part of a task list
          const taskListItem = React.Children.toArray(children).some(child => 
            React.isValidElement(child) && (child.type as any) === 'input' && child.props.type === 'checkbox'
          );
          return <li className={cn(props.className, taskListItem ? "list-none flex items-start gap-2 ml-[-1.25rem]" : "")} {...props}>{children}</li>;
        },
        input: ({node, type, checked, disabled, ...props}) => {
           if(type === 'checkbox') {
               return <input type="checkbox" checked={checked as boolean | undefined} disabled={disabled} readOnly className="form-checkbox h-4 w-4 text-primary rounded border-muted-foreground/50 mt-1 cursor-default focus:ring-0 focus:ring-offset-0" {...props}/>
           }
           return <input type={type as string} {...props} />
        },
        code: ({node, inline, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <pre className={cn(className, "rounded-md bg-muted/50 p-3 my-2 overflow-x-auto")} {...props}>
              <code className="text-foreground/90">{children}</code>
            </pre>
          ) : (
            <code className={cn(className, "bg-muted/50 text-primary px-1 py-0.5 rounded-sm text-xs")} {...props}>
              {children}
            </code>
          )
        },
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary/50 pl-3 italic text-muted-foreground my-2" {...props} />,
        hr: ({node, ...props}) => <hr className="border-border my-3" {...props} />,

      }}
    >
      {content}
    </ReactMarkdown>
  );
}
