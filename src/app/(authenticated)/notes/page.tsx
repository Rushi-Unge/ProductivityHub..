
"use client"

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, StickyNote, Palette } from "lucide-react";
import NoteCard from "@/components/note-card";
import AddNoteDialog from "@/components/add-note-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO string date
  updatedAt?: string; // ISO string date
  color: string; // e.g., 'default', 'yellow', 'blue', 'pink' etc. Matches keys in noteColorClasses
}

// Dummy notes with colors
const initialNotes: Note[] = [
  { id: "n1", title: "Project Ideas", content: "Brainstorm new features for the ProHub dashboard. Consider AI-driven insights or a team collaboration module.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-yellow-200" },
  { id: "n2", title: "Weekly Goals", content: "1. Finalize Q4 budget.\n2. Conduct user interviews for feedback.\n3. Write blog post on productivity.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-green-200" },
  { id: "n3", title: "Book Recommendations", content: "Atomic Habits by James Clear\nDeep Work by Cal Newport\nThe Pragmatic Programmer", createdAt: new Date().toISOString(), color: "bg-blue-200" },
  { id: "n4", title: "Quick Reminder", content: "Pick up dry cleaning on Friday after 5 PM.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-card" },
  { id: "n5", title: "Urgent: Client Call Prep", content: "Prepare agenda and slides for the call with Acme Corp. tomorrow morning.", createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-pink-200" },
];


export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real app, load notes from localStorage or an API
  }, []);

  const handleAddOrUpdateNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { createdAt?: string }, id?: string) => {
    if (id) { // Editing note
      setNotes(notes.map(n => n.id === id ? { ...n, ...noteData, updatedAt: new Date().toISOString() } : n));
      toast({ title: "Note Updated", description: `"${noteData.title}" has been updated.` });
    } else { // Adding new note
      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(), // Simple ID generation
        createdAt: new Date().toISOString(),
      };
      setNotes([newNote, ...notes]);
      toast({ title: "Note Added", description: `"${newNote.title}" has been added.` });
    }
  };

  const handleEditNote = (note: Note) => {
    setNoteToEdit(note);
    setIsDialogOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    const noteToDelete = notes.find(n => n.id === id);
    setNotes(notes.filter(n => n.id !== id));
    toast({ title: "Note Deleted", description: `"${noteToDelete?.title}" has been deleted.`, variant: "destructive" });
  };
  
  const openNewNoteDialog = () => {
    setNoteToEdit(null);
    setIsDialogOpen(true);
  };

  if (!isClient) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-56 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 md:p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center">
            <StickyNote className="mr-3 h-8 w-8 text-primary" /> My Notes
          </h1>
          <p className="text-muted-foreground">Capture your thoughts, ideas, and reminders. Click <Palette className="inline h-4 w-4"/> to color code!</p>
        </div>
        <Button onClick={openNewNoteDialog} className="shadow-md hover:shadow-lg transition-shadow">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-16">
          <StickyNote className="mx-auto h-20 w-20 text-muted-foreground opacity-30" />
          <p className="mt-6 text-xl font-medium text-muted-foreground">No notes yet.</p>
          <p className="text-sm text-muted-foreground">Click "Add Note" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {notes.map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onEdit={handleEditNote} 
              onDelete={handleDeleteNote} 
            />
          ))}
        </div>
      )}

      <AddNoteDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleAddOrUpdateNote} 
        noteToEdit={noteToEdit} 
      />
    </div>
  );
}
