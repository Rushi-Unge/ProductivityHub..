
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
      className={cn("prose prose-xs dark:prose-invert max-w-none leading-snug", className)} // Adjusted prose-xs, leading-snug
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-sm font-semibold mt-1 mb-0.5 font-headline" {...props} />, 
        h2: ({node, ...props}) => <h2 className="text-xs font-semibold mt-0.5 mb-0.5 font-headline" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-xs font-semibold mt-0.5 mb-0.5 font-headline" {...props} />,
        p: ({node, ...props}) => <p className="my-0.5" {...props} />, 
        ul: ({node, ...props}) => <ul className="my-0.5 pl-3.5 space-y-0" {...props} />, 
        ol: ({node, ...props}) => <ol className="my-0.5 pl-3.5 space-y-0" {...props} />,
        li: ({node, children, ...props}) => {
          const taskListItem = React.Children.toArray(children).some(child => 
            React.isValidElement(child) && (child.type as any) === 'input' && child.props.type === 'checkbox'
          );
          return <li className={cn(props.className, taskListItem ? "list-none flex items-start gap-1.5 ml-[-0.75rem]" : "my-0")} {...props}>{children}</li>; 
        },
        input: ({node, type, checked, disabled, ...props}) => {
           if(type === 'checkbox') {
               return <input type="checkbox" checked={checked as boolean | undefined} disabled={disabled} readOnly className="form-checkbox h-3 w-3 text-primary rounded-sm border-muted-foreground/40 mt-0.5 cursor-default focus:ring-0 focus:ring-offset-0" {...props}/> 
           }
           return <input type={type as string} {...props} />
        },
        code: ({node, inline, className, children, ...props}) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <pre className={cn(className, "rounded-md bg-muted/40 p-1.5 my-1 overflow-x-auto text-[10px]")} {...props}> 
              <code className="text-foreground/80 bg-transparent">{children}</code>
            </pre>
          ) : (
            <code className={cn(className, "bg-muted/40 text-primary px-0.5 py-0 rounded-sm text-[0.75em]")} {...props}> 
              {children}
            </code>
          )
        },
        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary/40 pl-1.5 italic text-muted-foreground/80 my-1 text-[10px]" {...props} />, 
        hr: ({node, ...props}) => <hr className="border-border/70 my-1" {...props} />, 
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
