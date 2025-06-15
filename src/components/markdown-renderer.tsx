
"use client"

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
        h1: ({node, ...props}) => <h1 className="text-3xl font-bold my-4 font-headline" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-2xl font-semibold my-3 font-headline" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-xl font-semibold my-2 font-headline" {...props} />,
        // You can add more customizations here for other elements if desired
        // For example, to make checklists interactive (though this requires state management):
        // li: ({node, className, children, ...props}) => {
        //   if (node?.children?.[0]?.type === 'html' && /<input type="checkbox"/.test(node.children[0].value as string) ) {
        //     // This is a basic example and might need more robust parsing.
        //     // Also, making them interactive requires handling onChange, which is complex here.
        //     return <li className={cn(className, "list-none flex items-center gap-2")} {...props}>{children}</li>;
        //   }
        //   return <li className={className} {...props}>{children}</li>;
        // },
        // input: ({node, ...props}) => {
        //    if(props.type === 'checkbox') {
        //        // This is just for styling, not making it interactive without more state logic
        //        return <input type="checkbox" className="form-checkbox h-4 w-4 text-primary rounded border-muted-foreground" {...props} />
        //    }
        //    return <input {...props} />
        // }
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
