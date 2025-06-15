
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
  onRestore: (id: string) => void; 
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
        "shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out flex flex-col rounded-xl border hover:border-primary/30 focus-within:ring-1 focus-within:ring-primary focus-within:ring-offset-1", 
        "bg-card text-card-foreground break-inside-avoid",
        note.isTrashed ? "opacity-60 hover:opacity-75" : "",
        note.isArchived && !isTrashedView ? "bg-muted/40 dark:bg-muted/10" : "",
        className
      )}>
      
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-3.5 px-3.5">
        {note.title && (
            <CardTitle className="text-sm font-semibold break-words text-foreground flex-1 line-clamp-2 cursor-pointer hover:underline" onClick={() => onEdit(note)}>
            {note.title}
            </CardTitle>
        )}
        <div className={cn("flex items-center gap-0.5 ml-1.5 flex-shrink-0", !note.title && "w-full justify-end")}>
          {!isTrashedView && !note.isArchived && (
            <Button variant="ghost" size="icon" onClick={() => onToggleStar(note.id)} title={note.isStarred ? "Unstar" : "Star"} className="h-7 w-7 rounded-lg text-muted-foreground hover:text-yellow-500">
                <Star className={cn("h-4 w-4", note.isStarred ? "text-yellow-400 fill-yellow-400" : "")} />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-foreground">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-xl w-44 border bg-popover">
             {!isTrashedView && (
                <>
                    <DropdownMenuItem onClick={() => onEdit(note)} className="cursor-pointer focus:bg-muted/80 text-sm">
                        <Edit3 className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Edit
                    </DropdownMenuItem>
                    {!note.isArchived && (
                        <DropdownMenuItem onClick={() => onToggleStar(note.id)} className="cursor-pointer focus:bg-muted/80 text-sm">
                            <Star className={cn("mr-2 h-3.5 w-3.5 text-muted-foreground", note.isStarred ? "text-yellow-500 fill-yellow-400" : "")} />
                            {note.isStarred ? "Unstar" : "Star"}
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onToggleArchive(note.id)} className="cursor-pointer focus:bg-muted/80 text-sm">
                        {note.isArchived ? <ArchiveRestore className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> : <Archive className="mr-2 h-3.5 w-3.5 text-muted-foreground" />}
                        {note.isArchived ? "Unarchive" : "Archive"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border" />
                </>
             )}
              {isTrashedView ? (
                <>
                    <DropdownMenuItem onClick={() => onRestore(note.id)} className="cursor-pointer focus:bg-muted/80 text-sm">
                        <RotateCcw className="mr-2 h-3.5 w-3.5 text-muted-foreground" /> Restore
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleTrash(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-sm">
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Forever
                    </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => onToggleTrash(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-sm">
                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Move to Trash
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-2.5 px-3.5 flex-grow min-h-[50px] cursor-pointer" onClick={() => onEdit(note)}>
        {note.content ? (
            <div className="text-xs text-muted-foreground"> 
              <MarkdownRenderer content={note.content} className="line-clamp-5" />
            </div>
        ) : (
             <div className="text-xs text-muted-foreground/60 italic flex items-center gap-1.5 py-2">
                Empty note
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-1.5 pt-2.5 pb-3 px-3.5 border-t mt-auto bg-card/50 dark:bg-muted/5 rounded-b-xl">
        {note.tags.length > 0 && (
             <div className="flex gap-1 flex-wrap w-full">
                {note.tags.slice(0, 3).map(tag => ( // Show max 3 tags for brevity
                    <Badge key={tag} variant="secondary" className="text-[9px] px-1 py-0 h-4 capitalize rounded-sm bg-secondary/60 hover:bg-secondary/80 font-normal">
                       {tag}
                    </Badge>
                ))}
                {note.tags.length > 3 && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 capitalize rounded-sm bg-secondary/60 hover:bg-secondary/80 font-normal">
                       +{note.tags.length - 3} more
                    </Badge>
                )}
            </div>
        )}
        <div className="flex items-center text-[10px] text-muted-foreground/70 w-full mt-0.5">
          <Clock className="mr-1 h-2.5 w-2.5" />
          {formatDistanceToNow(parseISO(lastModified), { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}
