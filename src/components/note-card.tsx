
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Archive, ArchiveRestore, Star, Clock, RotateCcw, Tag } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Note } from "@/app/(authenticated)/notes/page";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onToggleStar: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onToggleTrash: (id:string) => void;
  onRestore: (id: string) => void; // For restoring from trash
  isTrashedView?: boolean;
  className?: string;
}

export default function NoteCard({ 
    note, 
    onEdit, 
    onToggleStar, 
    onToggleArchive, 
    onToggleTrash, 
    onRestore,
    isTrashedView = false,
    className 
}: NoteCardProps) {
  const lastModified = note.updatedAt || note.createdAt;

  return (
    <Card className={cn(
        "shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col rounded-2xl border hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 break-inside-avoid-page", 
        "bg-card text-card-foreground",
        note.isTrashed ? "opacity-70 hover:opacity-80" : "",
        note.isArchived && !isTrashedView ? "bg-muted/50 dark:bg-muted/20" : "",
        className
      )}>
      
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-4 px-4">
        {note.title && (
            <CardTitle className="text-md font-semibold break-words text-foreground flex-1 line-clamp-2 cursor-pointer hover:underline" onClick={() => onEdit(note)}>
            {note.title}
            </CardTitle>
        )}
        <div className={cn("flex items-center gap-1 ml-2 flex-shrink-0", !note.title && "w-full justify-end")}>
          {!isTrashedView && !note.isArchived && (
            <Button variant="ghost" size="icon" onClick={() => onToggleStar(note.id)} title={note.isStarred ? "Unstar" : "Star"} className="h-8 w-8 rounded-lg text-muted-foreground hover:text-yellow-500">
                <Star className={cn("h-4 w-4", note.isStarred ? "text-yellow-400 fill-yellow-400" : "")} />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-48 border bg-popover">
             {!isTrashedView && (
                <>
                    <DropdownMenuItem onClick={() => onEdit(note)} className="cursor-pointer focus:bg-muted/80">
                        <Edit3 className="mr-2 h-4 w-4 text-muted-foreground" /> Edit Note
                    </DropdownMenuItem>
                    {!note.isArchived && (
                        <DropdownMenuItem onClick={() => onToggleStar(note.id)} className="cursor-pointer focus:bg-muted/80">
                            <Star className={cn("mr-2 h-4 w-4 text-muted-foreground", note.isStarred ? "text-yellow-500 fill-yellow-400" : "")} />
                            {note.isStarred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onToggleArchive(note.id)} className="cursor-pointer focus:bg-muted/80">
                        {note.isArchived ? <ArchiveRestore className="mr-2 h-4 w-4 text-muted-foreground" /> : <Archive className="mr-2 h-4 w-4 text-muted-foreground" />}
                        {note.isArchived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                </>
             )}
              {isTrashedView ? (
                <>
                    <DropdownMenuItem onClick={() => onRestore(note.id)} className="cursor-pointer focus:bg-muted/80">
                        <RotateCcw className="mr-2 h-4 w-4 text-muted-foreground" /> Restore Note
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
      <CardContent className="pb-3 px-4 flex-grow min-h-[60px] cursor-pointer" onClick={() => onEdit(note)}>
        {note.content ? (
            <div className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none line-clamp-[8]"> {/* Increased line clamp */}
              <MarkdownRenderer content={note.content} />
            </div>
        ) : (
             <div className="text-sm text-muted-foreground/70 italic flex items-center gap-1.5 py-2">
                Empty note
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 pt-3 pb-3 px-4 border-t mt-auto bg-card/50 dark:bg-muted/10 rounded-b-2xl">
        {note.tags.length > 0 && (
             <div className="flex gap-1.5 flex-wrap w-full">
                {note.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5 capitalize rounded-md bg-secondary/70 hover:bg-secondary">
                        <Tag className="h-3 w-3 mr-1 opacity-70"/>{tag}
                    </Badge>
                ))}
            </div>
        )}
        <div className="flex items-center text-xs text-muted-foreground/80 w-full">
          <Clock className="mr-1.5 h-3 w-3" />
          Edited {formatDistanceToNow(parseISO(lastModified), { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}
