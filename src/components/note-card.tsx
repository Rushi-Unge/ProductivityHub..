
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { Note } from "@/app/(authenticated)/notes/page";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const noteColorClasses: Record<string, string> = {
  default: "bg-card",
  yellow: "bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200/80 dark:hover:bg-yellow-800/50 border-yellow-300 dark:border-yellow-700",
  green: "bg-green-100 dark:bg-green-900/30 hover:bg-green-200/80 dark:hover:bg-green-800/50 border-green-300 dark:border-green-700",
  blue: "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200/80 dark:hover:bg-blue-800/50 border-blue-300 dark:border-blue-700",
  pink: "bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200/80 dark:hover:bg-pink-800/50 border-pink-300 dark:border-pink-700",
  purple: "bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200/80 dark:hover:bg-purple-800/50 border-purple-300 dark:border-purple-700",
};


export default function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const lastModified = note.updatedAt || note.createdAt;
  const cardColorClass = noteColorClasses[note.color || "default"] || noteColorClasses["default"];

  return (
    <Card className={cn("shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out flex flex-col h-full", cardColorClass)}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-semibold break-words">
          {note.title}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(note)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-4 flex-grow">
        <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words line-clamp-6">
          {note.content}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-end pt-3 border-t mt-auto">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1.5 h-3 w-3" />
          {formatDistanceToNow(parseISO(lastModified), { addSuffix: true })}
        </div>
      </CardFooter>
    </Card>
  );
}
