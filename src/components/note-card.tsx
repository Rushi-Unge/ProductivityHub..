
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Clock, Palette, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Note } from "@/app/(authenticated)/notes/page";
import { cn } from "@/lib/utils";
import NextImage from "next/image"; // Renamed to avoid conflict

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const lastModified = note.updatedAt || note.createdAt;
  const cardColorClass = note.color || "bg-card"; 

  // Determine if the note's background color is generally dark.
  // This is a heuristic based on common dark class patterns from Tailwind and theme.
  const isExplicitlyDarkBg = 
    note.color.includes("700") || 
    note.color.includes("800") || 
    note.color.includes("900") ||
    note.color.includes("slate") || // common dark neutral
    note.color.includes("zinc") || // common dark neutral
    note.color.includes("neutral") || // common dark neutral
    note.color === "bg-primary" || // Assuming primary might be dark
    note.color === "bg-accent"; // Assuming accent might be dark

  // In dark theme, card-foreground is light. In light theme, card-foreground is dark.
  // In dark theme, primary-foreground is light.
  const titleColorClass = isExplicitlyDarkBg ? "text-primary-foreground" : "text-card-foreground";
  
  // For content:
  // If explicit dark bg: light text with opacity
  // If light bg (in light mode): dark text (card-foreground) with opacity
  // If light bg (in dark mode, meaning cardColorClass is like `dark:bg-yellow-700/30` but the light part is `bg-yellow-200`): use card-foreground (which is light in dark mode) with opacity
  const contentColorClass = isExplicitlyDarkBg 
    ? "text-primary-foreground/80" 
    : "text-card-foreground/80 dark:text-card-foreground/70"; // Ensure good contrast for content on lighter backgrounds in both themes

  const footerTextColorClass = isExplicitlyDarkBg 
    ? "text-primary-foreground/70" 
    : "text-muted-foreground";

  const dropdownButtonClass = isExplicitlyDarkBg 
    ? "text-primary-foreground/70 hover:bg-white/10" 
    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10";
  
  const footerBorderClass = isExplicitlyDarkBg ? "border-white/20" : "border-border";


  return (
    <Card className={cn(
        "shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col rounded-lg border-transparent hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 break-inside-avoid-page", 
        cardColorClass
      )}>
      {note.imageUrl && (
        <div className="relative w-full aspect-[16/9] rounded-t-lg overflow-hidden">
            <NextImage 
                src={note.imageUrl} 
                alt={note.title || "Note image"} 
                fill // Changed from layout="fill" objectFit="cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint="note image user content"
            />
        </div>
      )}
      <CardHeader className="flex flex-row items-start justify-between pb-2 pt-4 px-4">
        <CardTitle className={cn("text-lg font-semibold break-words", titleColorClass)}>
          {note.title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8 flex-shrink-0 rounded-full", dropdownButtonClass)}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
             <DropdownMenuItem onClick={() => onEdit(note)} className="cursor-pointer">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-4 px-4 flex-grow">
        <p className={cn("text-sm whitespace-pre-wrap break-words", contentColorClass, note.imageUrl ? "line-clamp-4" : "line-clamp-[10]")}>
          {note.content}
        </p>
      </CardContent>
      <CardFooter className={cn("flex items-center justify-between pt-3 pb-3 px-4 border-t mt-auto", footerBorderClass)}>
        <div className={cn("flex items-center text-xs", footerTextColorClass)}>
          <Clock className="mr-1.5 h-3 w-3" />
          {formatDistanceToNow(parseISO(lastModified), { addSuffix: true })}
        </div>
        {note.imageFilename && !note.imageUrl && <ImageIcon className={cn("h-4 w-4", footerTextColorClass)} title={`Image: ${note.imageFilename}`} />}
      </CardFooter>
    </Card>
  );
}
