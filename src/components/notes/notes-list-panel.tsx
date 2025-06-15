
// This component is no longer used in the Google Keep-style notes page.
// The layout has been changed to a card grid.
// Keeping the file for now, but it can be deleted if not repurposed.

"use client"

import type { Note } from "@/app/(authenticated)/notes/page";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, Pin, Archive, Trash2, Tag, Search, RotateCcw, Star } from "lucide-react";
import NoteListItem from "./note-list-item"; // This would also be unused if the panel is removed
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotesListPanelProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onToggleTrash: (id: string) => void;
  onRestoreFromTrash: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onToggleStar: (id: string) => void;
}

type ActiveFilter = "all" | "starred" | "archived" | "trash";

export default function NotesListPanel({
  notes,
  selectedNoteId,
  onSelectNote,
  searchTerm,
  onSearchTermChange,
  onToggleTrash,
  onRestoreFromTrash,
  onToggleArchive,
  onToggleStar,
}: NotesListPanelProps) {

  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");

  const filteredNotes = useMemo(() => {
    let displayNotes = [...notes];
    if (searchTerm) {
      displayNotes = displayNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    switch(activeFilter) {
        case "starred":
            return displayNotes.filter(n => n.isStarred && !n.isArchived && !n.isTrashed);
        case "archived":
            return displayNotes.filter(n => n.isArchived && !n.isTrashed);
        case "trash":
            return displayNotes.filter(n => n.isTrashed);
        case "all":
        default:
            return displayNotes.filter(n => !n.isArchived && !n.isTrashed);
    }
  }, [notes, searchTerm, activeFilter]);
  
  const pinnedNotes = useMemo(() => 
    notes.filter(n => n.isStarred && !n.isArchived && !n.isTrashed &&
      (searchTerm ? 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      : true)
    ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
  [notes, searchTerm]);


  const SectionButton = ({ label, icon, count, filterType, isActive }: { label: string, icon: React.ReactNode, count: number, filterType: ActiveFilter, isActive: boolean}) => (
    <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "w-full justify-start h-9 px-2.5 rounded-lg text-sm",
            isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
        )}
        onClick={() => setActiveFilter(filterType)}
    >
        {icon}
        <span className="ml-2 flex-1 truncate">{label}</span>
        <span className={cn("text-xs px-1.5 py-0.5 rounded-md", isActive ? "bg-primary/20 text-primary" : "bg-muted/80 text-muted-foreground/80 dark:bg-muted/50")}>{count}</span>
    </Button>
  );


  return (
    <aside className="w-full md:w-[320px] border-r bg-card dark:bg-card/90 flex flex-col h-full">
      <div className="p-4 space-y-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-9 rounded-xl h-10 bg-background focus:bg-background/70"
          />
        </div>
        <div className="space-y-1">
            <SectionButton label="All Notes" icon={<Folder className="h-4 w-4"/>} count={notes.filter(n => !n.isArchived && !n.isTrashed).length} filterType="all" isActive={activeFilter === "all"}/>
            <SectionButton label="Starred" icon={<Star className="h-4 w-4"/>} count={notes.filter(n => n.isStarred && !n.isArchived && !n.isTrashed).length} filterType="starred" isActive={activeFilter === "starred"}/>
            <SectionButton label="Archived" icon={<Archive className="h-4 w-4"/>} count={notes.filter(n => n.isArchived && !n.isTrashed).length} filterType="archived" isActive={activeFilter === "archived"}/>
            <SectionButton label="Trash" icon={<Trash2 className="h-4 w-4"/>} count={notes.filter(n => n.isTrashed).length} filterType="trash" isActive={activeFilter === "trash"}/>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {activeFilter === 'all' && pinnedNotes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2 flex items-center">
                <Pin className="h-3.5 w-3.5 mr-1.5 text-yellow-500"/> Pinned
              </h3>
              <div className="space-y-1">
                {pinnedNotes.map(note => (
                  <NoteListItem
                    key={note.id}
                    note={note}
                    isSelected={selectedNoteId === note.id}
                    onSelectNote={onSelectNote}
                  />
                ))}
              </div>
               <DropdownMenuSeparator className="my-3"/>
            </div>
          )}
          
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-sm">
                {searchTerm ? "No notes match your search." : 
                 activeFilter === "trash" ? "Trash is empty." :
                 activeFilter === "archived" ? "No archived notes." :
                 activeFilter === "starred" ? "No starred notes." :
                 "No notes here yet."
                }
                </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes
                .filter(note => activeFilter === 'all' ? !note.isStarred : true) // if 'all' filter, don't show starred here as they are above
                .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                .map(note => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isSelected={selectedNoteId === note.id}
                  onSelectNote={onSelectNote}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
