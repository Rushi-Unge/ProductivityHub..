
"use client"

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Star, Archive, Trash2, Pin, PinOff, Folder, Edit3, Eye, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotesListPanel from "@/components/notes/notes-list-panel";
import NoteEditorDisplay from "@/components/notes/note-editor-display";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isStarred: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string; 
  updatedAt: string; 
}

const initialNotesData: Note[] = [
  { id: "n1", title: "Project Ideas for ProHub", content: "1. AI-driven task suggestions.\n2. Team collaboration module.\n3. Customizable dashboard widgets.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), tags: ["project", "ideas", "prohub"], isStarred: true, isArchived: false, isTrashed: false },
  { id: "n2", title: "Daily Journal - July 28", content: "### Morning Reflections\nFeeling productive today. Started with a good workout.\n\n### Afternoon Tasks\n- Worked on the Notes page design.\n- Reviewed PRs.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), tags: ["journal", "daily"], isStarred: false, isArchived: false, isTrashed: false },
  { id: "n3", title: "Markdown Cheatsheet", content: "# H1\n## H2\n### H3\n\n*italic*\n**bold**\n\n- List item 1\n- List item 2\n\n`inline code`\n\n```javascript\nconsole.log('hello');\n```", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ["markdown", "cheatsheet", "dev"], isStarred: true, isArchived: false, isTrashed: false },
  { id: "n4", title: "Archived Meeting Notes Q1", content: "Old meeting notes from Q1. No longer actively needed but kept for reference.", createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), tags: ["meeting", "archive"], isStarred: false, isArchived: true, isTrashed: false },
  { id: "n5", title: "Note to be deleted", content: "This note is intended for the trash.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), tags: ["temp"], isStarred: false, isArchived: false, isTrashed: true },
  { id: "n6", title: "Grocery List", content: "- Milk\n- Eggs\n- Bread\n- Apples", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), tags: ["personal", "shopping"], isStarred: false, isArchived: false, isTrashed: false },
];


export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotesData);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Select the first available non-trashed, non-archived note by default
    const firstNote = notes.find(n => !n.isArchived && !n.isTrashed);
    if (firstNote) {
      setSelectedNoteId(firstNote.id);
    }
  }, [notes]); // Only run once on mount based on initial notes, or when notes array identity changes.

  const handleSelectNote = useCallback((id: string) => {
    setSelectedNoteId(id);
  }, []);

  const handleUpdateNote = useCallback((updatedNote: Note) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date().toISOString() } : n));
    toast({ title: "Note Saved", description: `"${updatedNote.title}" has been updated.` });
  }, [toast]);

  const handleCreateNewNote = useCallback(() => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      tags: [],
      isStarred: false,
      isArchived: false,
      isTrashed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes(prevNotes => [newNote, ...prevNotes]);
    setSelectedNoteId(newNote.id);
    toast({ title: "New Note Created" });
  }, [toast]);
  
  // Expose createNewNote to global scope for sidebar button
  useEffect(() => {
    if (isClient) {
      (window as any).createNewNote = handleCreateNewNote;
    }
    return () => {
      if (isClient) {
        delete (window as any).createNewNote;
      }
    }
  }, [isClient, handleCreateNewNote]);

  const handleToggleStar = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isStarred: !n.isStarred, updatedAt: new Date().toISOString() } : n));
    const note = notes.find(n => n.id === id);
    toast({ title: note?.isStarred ? "Note Unpinned" : "Note Pinned" });
  }, [notes, toast]);

  const handleToggleArchive = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isArchived: !n.isArchived, isStarred: false, isTrashed: false, updatedAt: new Date().toISOString() } : n));
    const note = notes.find(n => n.id === id);
    toast({ title: note?.isArchived ? "Note Unarchived" : "Note Archived" });
    if (selectedNoteId === id && !note?.isArchived) { // if current note is archived, deselect it
        const nextSelectableNote = notes.find(n => n.id !== id && !n.isArchived && !n.isTrashed);
        setSelectedNoteId(nextSelectableNote ? nextSelectableNote.id : null);
    }
  }, [notes, toast, selectedNoteId]);

  const handleToggleTrash = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (note.isTrashed) { // Permanently delete
      setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
      toast({ title: "Note Permanently Deleted", variant: "destructive" });
      if (selectedNoteId === id) setSelectedNoteId(null);
    } else { // Move to trash
      setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isTrashed: true, isStarred: false, isArchived: false, updatedAt: new Date().toISOString() } : n));
      toast({ title: "Note Moved to Trash" });
       if (selectedNoteId === id) {
         const nextSelectableNote = notes.find(n => n.id !== id && !n.isArchived && !n.isTrashed);
         setSelectedNoteId(nextSelectableNote ? nextSelectableNote.id : null);
       }
    }
  }, [notes, toast, selectedNoteId]);

  const handleRestoreFromTrash = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isTrashed: false, updatedAt: new Date().toISOString() } : n));
    toast({ title: "Note Restored" });
  }, [toast]);


  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null;
    return notes.find(note => note.id === selectedNoteId) || null;
  }, [selectedNoteId, notes]);

  if (!isClient) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height)-0px)] animate-fade-in">
        <aside className="w-full md:w-[320px] p-4 border-r bg-card dark:bg-card/80 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-6 w-1/3 rounded-lg mt-4" />
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
          <Skeleton className="h-6 w-1/3 rounded-lg mt-4" />
          {[...Array(2)].map((_, i) => <Skeleton key={i+3} className="h-16 w-full rounded-lg" />)}
        </aside>
        <main className="flex-1 p-4 md:p-6 space-y-4">
          <Skeleton className="h-12 w-3/4 rounded-lg" />
          <Skeleton className="h-8 w-1/2 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </main>
      </div>
    );
  }
  
  return (
    <div className="flex h-[calc(100vh-var(--header-height)-0px)]">
      <NotesListPanel
        notes={notes}
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onToggleTrash={handleToggleTrash}
        onRestoreFromTrash={handleRestoreFromTrash}
        onToggleArchive={handleToggleArchive}
        onToggleStar={handleToggleStar}
      />
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        {selectedNote ? (
          <NoteEditorDisplay
            key={selectedNote.id} // Re-mount when note changes for clean state
            note={selectedNote}
            onUpdateNote={handleUpdateNote}
            onToggleStar={handleToggleStar}
            onToggleArchive={handleToggleArchive}
            onDeleteNote={handleToggleTrash} // This moves to trash
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50 mb-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            <p className="text-lg font-medium">No note selected</p>
            <p className="text-sm">Select a note from the list or create a new one.</p>
            <Button onClick={handleCreateNewNote} className="mt-6 rounded-xl">
                <Plus className="mr-2 h-4 w-4"/> Create New Note
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
