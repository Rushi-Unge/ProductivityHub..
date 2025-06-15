
"use client"

import type { Note } from "@/app/(authenticated)/notes/page";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import { Pin, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NoteListItemProps {
  note: Note;
  isSelected: boolean;
  onSelectNote: (id: string) => void;
}

export default function NoteListItem({ note, isSelected, onSelectNote }: NoteListItemProps) {
  const contentSnippet = note.content ? note.content.substring(0, 70) + (note.content.length > 70 ? "..." : "") : "No content";
  const lastUpdated = formatDistanceToNow(parseISO(note.updatedAt), { addSuffix: true });

  return (
    <button
      onClick={() => onSelectNote(note.id)}
      className={cn(
        "w-full text-left p-3 rounded-lg transition-colors duration-150 ease-in-out block border border-transparent",
        isSelected ? "bg-primary/10 border-primary/30 shadow-sm" : "hover:bg-muted/50 dark:hover:bg-muted/30",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-card"
      )}
      aria-current={isSelected ? "page" : undefined}
    >
      <div className="flex justify-between items-start">
        <h3 className={cn("text-sm font-semibold truncate text-foreground", isSelected && "text-primary")}>
          {note.title || "Untitled Note"}
        </h3>
        {note.isStarred && <Pin className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400 flex-shrink-0 ml-2" />}
      </div>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{contentSnippet}</p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 overflow-hidden">
            {note.tags.slice(0,2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded capitalize whitespace-nowrap">
                    {tag}
                </Badge>
            ))}
            {note.tags.length > 2 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap">+{note.tags.length - 2}</Badge>}
        </div>
        <p className="text-xs text-muted-foreground/80 flex-shrink-0 ml-2">{lastUpdated}</p>
      </div>
    </button>
  );
}
