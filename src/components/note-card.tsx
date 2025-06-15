
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Archive, ArchiveRestore, Pin, PinOff, Clock, Image as ImageIcon, RotateCcw } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Note } from "@/app/(authenticated)/notes/page";
import { cn } from "@/lib/utils";
import NextImage from "next/image";
import ReactMarkdown from 'react-markdown';
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onToggleTrash: (id: string) => void;
  onRestore: (id: string) => void;
  isTrashedView?: boolean;
}

export default function NoteCard({ note, onEdit, onTogglePin, onToggleArchive, onToggleTrash, onRestore, isTrashedView = false }: NoteCardProps) {
  const lastModified = note.updatedAt || note.createdAt;
  const cardColorClass = note.color || "bg-card";

  // Heuristic for determining if background is dark (for text color)
  const isDarkBg = cardColorClass.includes("700") || cardColorClass.includes("800") || cardColorClass.includes("900") || 
                   cardColorClass.includes("slate") || cardColorClass.includes("zinc") || cardColorClass.includes("neutral") ||
                   (cardColorClass.includes("bg-primary") && !cardColorClass.includes("foreground")) || // If primary itself is dark
                   (cardColorClass.includes("dark:") && !cardColorClass.includes("bg-card")); // Explicit dark mode color that's not default card

  const titleColorClass = isDarkBg ? "text-primary-foreground" : "text-card-foreground";
  const contentColorClass = isDarkBg ? "text-primary-foreground/80" : "text-card-foreground/80 dark:text-card-foreground/70";
  const footerTextColorClass = isDarkBg ? "text-primary-foreground/60" : "text-muted-foreground";
  const dropdownButtonClass = isDarkBg ? "text-primary-foreground/70 hover:bg-white/10" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10";
  const footerBorderClass = isDarkBg ? "border-white/20" : "border-border";

  const contentPreview = note.content.length > 200 
    ? note.content.substring(0, 200) + "..." 
    : note.content;

  return (
    <Card className={cn(
        "shadow-md hover:shadow-lg transition-all duration-300 ease-in-out flex flex-col rounded-2xl border-transparent hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 break-inside-avoid-page", 
        cardColorClass,
        note.isTrashed ? "opacity-70" : ""
      )}>
      {note.imageUrl && (
        <div className="relative w-full aspect-[16/9] rounded-t-2xl overflow-hidden">
            <NextImage 
                src={note.imageUrl} 
                alt={note.title || "Note image"} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint={note.imageFilename ? note.imageFilename.split('.')[0] : "note image"}
            />
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-4 px-4">
        <CardTitle className={cn("text-lg font-semibold break-words", titleColorClass)}>
          {note.title}
        </CardTitle>
        <div className="flex items-center gap-1">
          {note.isPinned && !note.isArchived && !note.isTrashed && <Pin className={cn("h-4 w-4", titleColorClass, "opacity-70")} />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className={cn("h-8 w-8 flex-shrink-0 rounded-full", dropdownButtonClass)}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-lg">
             {!isTrashedView && (
                <>
                    <DropdownMenuItem onClick={() => onEdit(note)} className="cursor-pointer">
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Note
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onTogglePin(note.id)} className="cursor-pointer">
                        {note.isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                        {note.isPinned ? "Unpin Note" : "Pin Note"}
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
      <CardContent className="pb-4 px-4 flex-grow min-h-[60px]">
        <div className={cn("text-sm whitespace-pre-wrap break-words prose prose-sm dark:prose-invert max-w-none", contentColorClass, note.imageUrl ? "line-clamp-3" : "line-clamp-5")}>
          <ReactMarkdown
            components={{
              // Optional: Customize how specific Markdown elements are rendered
              p: ({node, ...props}) => <p className="my-1" {...props} />, // tighter spacing for preview
              ul: ({node, ...props}) => <ul className="my-1 pl-4" {...props} />,
              ol: ({node, ...props}) => <ol className="my-1 pl-4" {...props} />,
              li: ({node, ...props}) => <li className="my-0.5" {...props} />,
              h1: ({node, ...props}) => <h1 className="text-base font-medium my-1" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-sm font-medium my-1" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-sm font-medium my-1" {...props} />,
            }}
          >
            {contentPreview}
          </ReactMarkdown>
        </div>
      </CardContent>
      <CardFooter className={cn("flex items-center justify-between pt-3 pb-3 px-4 border-t mt-auto", footerBorderClass)}>
        <div className={cn("flex items-center text-xs", footerTextColorClass)}>
          <Clock className="mr-1.5 h-3 w-3" />
          {formatDistanceToNow(parseISO(lastModified), { addSuffix: true })}
        </div>
        <div className="flex gap-1">
            {note.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className={cn("text-xs px-1.5 py-0.5", isDarkBg ? "border-primary-foreground/30 text-primary-foreground/70" : "border-border")}>{tag}</Badge>
            ))}
            {note.tags.length > 2 && <Badge variant="outline"  className={cn("text-xs px-1.5 py-0.5", isDarkBg ? "border-primary-foreground/30 text-primary-foreground/70" : "border-border")}>+{note.tags.length - 2}</Badge>}
            {note.imageFilename && !note.imageUrl && <ImageIcon className={cn("h-4 w-4", footerTextColorClass)} title={`Image: ${note.imageFilename}`} />}
        </div>
      </CardFooter>
    </Card>
  );
}
