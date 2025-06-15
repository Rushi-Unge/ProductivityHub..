
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Archive, ArchiveRestore, Star, Clock, RotateCcw, MessageSquareWarning, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Note } from "@/app/(authenticated)/notes/page";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onToggleStar: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onToggleTrash: (id:string) => void;
  onRestore: (id: string) => void;
  isTrashedView?: boolean;
}

export default function NoteCard({ note, onEdit, onToggleStar, onToggleArchive, onToggleTrash, onRestore, isTrashedView = false }: NoteCardProps) {
  const lastModified = note.updatedAt || note.createdAt;

  const contentPreview = note.content.length > 180 
    ? note.content.substring(0, 180) + "..." 
    : note.content;

  return (
    <Card className={cn(
        "shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col rounded-2xl border hover:scale-[1.01] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 break-inside-avoid-page", 
        "bg-card text-card-foreground",
        note.isTrashed ? "opacity-60" : ""
      )}>
      {note.imageUrl && (
        <div className="relative w-full aspect-[16/9] rounded-t-2xl overflow-hidden">
            <NextImage 
                src={note.imageUrl} 
                alt={note.title || "Note image"} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint={note.imageFilename ? note.imageFilename.split('.')[0] : "note image abstract"}
            />
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-4 px-4">
        <CardTitle className="text-md font-semibold break-words text-foreground flex-1 line-clamp-2">
          {note.title || <span className="italic text-muted-foreground">Untitled Note</span>}
        </CardTitle>
        <div className="flex items-center gap-1 ml-2">
          {note.isStarred && !note.isArchived && !note.isTrashed && <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 rounded-lg text-muted-foreground hover:bg-muted">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-lg w-48">
             {!isTrashedView && (
                <>
                    <DropdownMenuItem onClick={() => onEdit(note)} className="cursor-pointer">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleStar(note.id)} className="cursor-pointer">
                        <Star className={cn("mr-2 h-4 w-4", note.isStarred ? "text-yellow-500 fill-yellow-400" : "")} />
                        {note.isStarred ? "Unstar Note" : "Star Note"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleArchive(note.id)} className="cursor-pointer">
                        {note.isArchived ? <ArchiveRestore className="mr-2 h-4 w-4" /> : <Archive className="mr-2 h-4 w-4" />}
                        {note.isArchived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                </>
             )}
              {isTrashedView ? (
                <>
                    <DropdownMenuItem onClick={() => onRestore(note.id)} className="cursor-pointer">
                        <RotateCcw className="mr-2 h-4 w-4" /> Restore Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleTrash(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete Permanently
                    </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => onToggleTrash(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <Trash2 className="mr-2 h-4 w-4" /> Move to Trash
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4 flex-grow min-h-[60px]">
        {note.content ? (
            <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none line-clamp-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}
                components={{
                  p: ({node, ...props}) => <p className="my-1" {...props} />,
                  ul: ({node, ...props}) => <ul className="my-1 pl-4" {...props} />,
                  ol: ({node, ...props}) => <ol className="my-1 pl-4" {...props} />,
                  li: ({node, ...props}) => <li className="my-0.5" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-[1em] font-medium my-1" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-[0.9em] font-medium my-1" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-[0.9em] font-medium my-1" {...props} />,
                  input: ({ node, type, checked, ...props }) => {
                    if (type === 'checkbox') {
                      return <input type="checkbox" checked={checked as boolean | undefined} readOnly className="mr-1.5 rounded-sm border-muted-foreground text-primary focus:ring-primary disabled:opacity-100" />;
                    }
                    return <input type={type} {...props} />;
                  },
                }}
              >
                {contentPreview}
              </ReactMarkdown>
            </div>
        ) : (
             <div className="text-sm text-muted-foreground/70 italic flex items-center gap-1.5 py-2">
                <MessageSquareWarning className="h-4 w-4"/> No content yet.
            </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-3 pb-3 px-4 border-t mt-auto">
        <div className="flex items-center text-xs text-muted-foreground/80">
          <Clock className="mr-1.5 h-3 w-3" />
          {formatDistanceToNow(parseISO(lastModified), { addSuffix: true })}
        </div>
        <div className="flex gap-1 flex-wrap justify-end max-w-[50%] overflow-hidden">
            {note.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5 capitalize rounded-md">{tag}</Badge>
            ))}
            {note.tags.length > 2 && <Badge variant="secondary" className="text-xs px-1.5 py-0.5 rounded-md">+{note.tags.length - 2}</Badge>}
        </div>
      </CardFooter>
    </Card>
  );
}
