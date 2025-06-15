
"use client"

import { useState } from 'react';
import MarkdownRenderer from '@/components/markdown-renderer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockDocs = [
  {
    category: "Getting Started",
    articles: [
      { title: "Welcome to ProHub", content: "# Welcome to ProHub\n\nThis guide will help you get started with ProHub and make the most of its productivity features. ProHub is designed to be your central hub for managing tasks, notes, and trades.\n\n## Key Features:\n- **Dashboard**: Get a quick overview of your productivity.\n- **Task Management**: Create, organize, and prioritize your tasks with AI assistance.\n- **Notes**: Capture ideas, journals, reminders, and detailed notes with markdown support, color-coding, and image attachments.\n- **Trades**: Log and analyze your trades to improve your strategies." },
      { title: "Account Setup & Navigation", content: "# Account Setup & Navigation\n\n## Setting Up Your Account\n1. **Sign Up**: If you're new, use the Sign Up form with your email and a secure password.\n2. **Login**: Existing users can log in using their credentials.\n3. **Profile Settings**: Navigate to 'Settings > Profile' to update your name, email, and avatar.\n\n## Navigating ProHub\nThe main navigation is on the left sidebar. It provides quick access to all sections:\n- **Dashboard**: Your landing page after login.\n- **Tasks**: Manage all your to-do items.\n- **Notes**: Your personal note-taking space with advanced features.\n- **Trades**: Log and review trades.\n- **Docs**: You are here! Access help and documentation.\n- **Settings**: Customize your profile and application preferences." },
    ],
  },
  {
    category: "Task Management",
    articles: [
      { title: "Creating and Managing Tasks", content: "## Creating Tasks\n\nTo create a new task:\n1. Go to the 'Tasks' page.\n2. Click the **'+ Add Task'** button.\n3. Fill in the title, description (optional), due date (optional), and priority.\n4. Click 'Add Task' to save.\n\n## Editing and Deleting Tasks\n- **Edit**: Click the three-dot menu on a task card and select 'Edit'.\n- **Delete**: Click the three-dot menu and select 'Delete'.\n- **Mark Complete**: Check the checkbox on the task card or within the edit dialog." },
      { title: "AI Task Prioritization", content: "## Using AI Task Prioritization\n\nProHub's AI can help you sort your pending tasks based on urgency and importance.\n1. Go to the 'Tasks' page.\n2. Ensure you have pending tasks.\n3. Click the **'Prioritize with AI'** button.\n4. The AI will analyze your tasks (title, description, deadline, importance) and reorder them, adding a suggested priority and a reason for its decision.\n\n*Note: AI prioritization works best with clear descriptions and realistic deadlines.*" },
    ],
  },
  {
    category: "Notes Feature",
    articles: [
        { title: "Taking and Organizing Notes", content: "## Creating a New Note\n1. Navigate to the 'Notes' page.\n2. Click the **'+ New Note'** button in the left sidebar.\n3. Enter a title and content for your note using Markdown for rich formatting.\n4. **Choose a Color**: Select a color from the palette to visually categorize your note.\n5. **Add an Image (Optional)**: Click 'Upload Image' to attach an image to your note.\n6. **Tags**: Add relevant tags (comma-separated) to help organize and find your notes later.\n7. Click 'Add Note' to save.\n\n## Editing and Deleting Notes\n- **Edit**: Click the edit icon on a note card or open the note and use the editor.\n- **Delete**: Moves the note to 'Trash'. From 'Trash', notes can be permanently deleted or restored (feature to be fully implemented).\n\n## Pinning, Archiving\n- **Pin**: Keep important notes at the top of your 'All Notes' and in the 'Pinned' section.\n- **Archive**: Move notes you don't need active access to but want to keep." },
        { title: "Markdown Support", content: "## Markdown in Notes\n\nProHub notes support Markdown for rich text formatting. This includes:\n- **Headings**: `# H1`, `## H2`, `### H3`\n- **Emphasis**: `*italic*`, `_italic_`, `**bold**`, `__bold__`\n- **Lists**: Unordered (`- item` or `* item`) and ordered (`1. item`)\n- **Checklists**: `- [ ] To do`, `- [x] Done` (basic support)\n- **Links**: `[link text](url)`\n- **Images**: `![alt text](image_url)` (currently uses placeholder for uploaded images)\n- **Code Blocks**: Indent with four spaces or use triple backticks \\\`\\\`\\\`code\\\`\\\`\\\` \n- **Inline Code**: \\\`code\\\`\n- **Blockquotes**: `> quote`\n- **Horizontal Rules**: `---` or `***`" }
    ],
  },
  {
    category: "Trades (Trading Journal)",
    articles: [
        { title: "Logging Trades", content: "## Adding a New Trade\n1. Go to the 'Trades' page.\n2. Click **'+ New Trade'**.\n3. Fill in the trade details: Asset, Position (Long/Short), Entry/Exit Date & Time, Entry/Exit Price, Quantity, Strategy, Reflection, Risk %.\n4. **Add Screenshot (Optional)**: Upload a screenshot of your trade setup (filename stored).\n5. Click 'Add Trade'.\n\n## Reviewing Performance\nThe journal provides summary statistics like Total P&L, Win Rate, Average Win, and Average Loss to help you analyze your trading performance."}
    ]
  }
];

export default function DocsPage() {
  const [selectedArticle, setSelectedArticle] = useState(mockDocs[0].articles[0]);

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,4rem)-2rem)] md:flex-row gap-6 p-4 md:p-6">
      <aside className="w-full md:w-72 lg:w-80">
        <Card className="shadow-lg h-full rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold font-headline flex items-center">
              <BookOpen className="mr-2 h-6 w-6 text-primary"/> Documentation
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-var(--header-height,4rem)-8rem)] pr-0 pl-2 md:pl-0">
              <Accordion type="multiple" defaultValue={[mockDocs[0].category]} className="w-full">
                {mockDocs.map((categoryItem) => (
                  <AccordionItem value={categoryItem.category} key={categoryItem.category} className="border-b-0 md:border-b">
                    <AccordionTrigger className="text-md font-semibold hover:no-underline px-4 py-3 hover:bg-muted/50 rounded-md">
                      {categoryItem.category}
                    </AccordionTrigger>
                    <AccordionContent className="pl-2">
                      <ul className="space-y-1 py-1">
                        {categoryItem.articles.map((article) => (
                          <li key={article.title}>
                            <button
                              onClick={() => setSelectedArticle(article)}
                              className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center transition-colors
                                ${selectedArticle.title === article.title 
                                  ? 'bg-primary/10 text-primary font-medium' 
                                  : 'hover:bg-muted/50 dark:hover:bg-muted/20'
                                }`}
                            >
                              <ChevronRight className={`mr-1.5 h-4 w-4 transition-transform ${selectedArticle.title === article.title ? 'text-primary' : '' }`} />
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
          </CardContent>
        </Card>
      </aside>

      <main className="flex-1">
         <Card className="shadow-lg h-full rounded-2xl">
            <ScrollArea className="h-full p-1">
              <div className="p-4 md:p-6 prose dark:prose-invert max-w-none">
                <MarkdownRenderer content={selectedArticle.content} />
              </div>
            </ScrollArea>
        </Card>
      </main>
    </div>
  );
}
