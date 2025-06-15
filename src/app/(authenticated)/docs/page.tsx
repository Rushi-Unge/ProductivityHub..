
"use client"

import { useState } from 'react';
import MarkdownRenderer from '@/components/markdown-renderer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight } from 'lucide-react';

const mockDocs = [
  {
    category: "Getting Started",
    articles: [
      { title: "Introduction", content: "# Introduction to ProHub\n\nWelcome to ProHub! This document provides an overview of our platform and its key features designed to boost your productivity." },
      { title: "Account Setup", content: "# Account Setup\n\nFollow these steps to set up your ProHub account:\n1. Navigate to the signup page.\n2. Enter your email and password.\n3. Verify your email address.\n\nThat's it! You're ready to go." },
    ],
  },
  {
    category: "Task Management",
    articles: [
      { title: "Creating Tasks", content: "## Creating Tasks\n\nTo create a new task, click the 'Add Task' button. Fill in the title, description, due date, and priority. \n\n```javascript\n// Example code for task creation (conceptual)\nconst task = {\n  title: 'My New Task',\n  priority: 'high'\n};\n```" },
      { title: "Using AI Prioritization", content: "## Using AI Prioritization\n\nOur AI assistant can help you prioritize your tasks. Click the 'Prioritize with AI' button on the tasks page. The AI will analyze your tasks based on urgency and importance." },
    ],
  },
  {
    category: "Focus Timer",
    articles: [
      { title: "Pomodoro Technique", content: "### The Pomodoro Technique\n\nThe focus timer uses the Pomodoro Technique. Work in focused 25-minute intervals with short breaks in between." },
    ],
  },
];

export default function DocsPage() {
  const [selectedArticle, setSelectedArticle] = useState(mockDocs[0].articles[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)] md:flex-row gap-6">
      {/* Sidebar for navigation */}
      <aside className="w-full md:w-72 lg:w-80 border-r pr-6">
        <ScrollArea className="h-full pr-4">
          <h2 className="text-2xl font-bold font-headline mb-4">Documentation</h2>
          <Accordion type="multiple" defaultValue={[mockDocs[0].category]} className="w-full">
            {mockDocs.map((categoryItem) => (
              <AccordionItem value={categoryItem.category} key={categoryItem.category}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  {categoryItem.category}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 pl-2">
                    {categoryItem.articles.map((article) => (
                      <li key={article.title}>
                        <button
                          onClick={() => setSelectedArticle(article)}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center transition-colors
                            ${selectedArticle.title === article.title 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : 'hover:bg-muted/50'
                            }`}
                        >
                          <ChevronRight className={`mr-2 h-4 w-4 transition-transform ${selectedArticle.title === article.title ? 'rotate-90 text-primary' : '' }`} />
                          {article.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full p-1">
          <div className="bg-card p-6 md:p-8 rounded-lg shadow">
            <MarkdownRenderer content={selectedArticle.content} />
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

// Define CSS variable for header height in globals.css or AppShell if needed
// :root { --header-height: 4rem; } 
// Or adjust h-[calc(...)] based on actual header height
