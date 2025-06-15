
"use client"

import * as React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, Folder, Star as StarIcon, Archive as ArchiveIcon, Trash2 as TrashIcon, Tag as TagIcon, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import NoteCard from "@/components/note-card";
import AddNoteDialog from "@/components/add-note-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  { id: "n3", title: "Markdown Cheatsheet", content: "# H1\n## H2\n### H3\n\n*italic*\n**bold**\n\n- List item 1\n- List item 2\n\n`inline code`\n\n```javascript\nconsole.log('hello');\n```\n\nChecklists:\n- [ ] Task 1\n- [x] Task 2 (done)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ["markdown", "cheatsheet", "dev"], isStarred: true, isArchived: false, isTrashed: false },
  { id: "n4", title: "Archived Meeting Notes Q1", content: "Old meeting notes from Q1. No longer actively needed but kept for reference.", createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), tags: ["meeting", "archive"], isStarred: false, isArchived: true, isTrashed: false },
  { id: "n5", title: "Note to be deleted", content: "This note is intended for the trash.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), tags: ["temp"], isStarred: false, isArchived: false, isTrashed: true },
  { id: "n6", title: "Grocery List", content: "- Milk\n- Eggs\n- Bread\n- Apples\n- Chicken Breast\n- Spinach\n- Olive Oil\n- Pasta\n- Tomato Sauce\n- Cheese\n\nRemember to check expiry dates!", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), tags: ["personal", "shopping"], isStarred: false, isArchived: false, isTrashed: false },
];

type ActiveFilter = "all" | "starred" | "archived" | "trash" | string; // string for tag filter

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotesData);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    const handleGlobalNewNote = () => {
      setNoteToEdit(null);
      setIsDialogOpen(true);
    };
    if (isClient) {
      (window as any).createNewNote = handleGlobalNewNote;
    }
    return () => {
      if (isClient) {
        delete (window as any).createNewNote;
      }
    }
  }, [isClient]);


  const handleSaveNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isTrashed' | 'tags'> & { tagsString?: string, isStarred: boolean }, id?: string) => {
    const tagsArray = noteData.tagsString ? noteData.tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    if (id) { 
      setNotes(prevNotes => prevNotes.map(n => n.id === id ? { 
        ...n, 
        title: noteData.title, 
        content: noteData.content || "", 
        tags: tagsArray, 
        isStarred: noteData.isStarred,
        updatedAt: new Date().toISOString() 
      } : n));
      toast({ title: "Note Updated", description: `"${noteData.title}" has been saved.` });
    } else { 
      const newNote: Note = {
        id: Date.now().toString(),
        title: noteData.title,
        content: noteData.content || "",
        tags: tagsArray,
        isStarred: noteData.isStarred,
        isArchived: false,
        isTrashed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes(prevNotes => [newNote, ...prevNotes]);
      toast({ title: "Note Created", description: `"${newNote.title}" added.` });
    }
    setIsDialogOpen(false);
    setNoteToEdit(null);
  }, [toast]);

  const handleEditNote = useCallback((note: Note) => {
    setNoteToEdit(note);
    setIsDialogOpen(true);
  }, []);

  const handleToggleStar = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isStarred: !n.isStarred, updatedAt: new Date().toISOString() } : n));
    const note = notes.find(n => n.id === id);
    toast({ title: note?.isStarred ? "Note Unstarred" : "Note Starred" });
  }, [notes, toast]);

  const handleToggleArchive = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isArchived: !n.isArchived, isStarred: false, isTrashed: false, updatedAt: new Date().toISOString() } : n));
    const note = notes.find(n => n.id === id);
    toast({ title: note?.isArchived ? "Note Unarchived" : "Note Archived" });
  }, [notes, toast]);

  const handleToggleTrash = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (!note) return;

    if (note.isTrashed) { 
      setNotes(prevNotes => prevNotes.filter(n => n.id !== id));
      toast({ title: "Note Permanently Deleted", variant: "destructive" });
    } else { 
      setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isTrashed: true, isStarred: false, isArchived: false, updatedAt: new Date().toISOString() } : n));
      toast({ title: "Note Moved to Trash" });
    }
  }, [notes, toast]);

  const handleRestoreFromTrash = useCallback((id: string) => {
    setNotes(prevNotes => prevNotes.map(n => n.id === id ? { ...n, isTrashed: false, updatedAt: new Date().toISOString() } : n));
    toast({ title: "Note Restored" });
  }, [toast]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.filter(n => !n.isTrashed && !n.isArchived).forEach(note => note.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [notes]);

  const filteredNotes = useMemo(() => {
    let displayNotes = [...notes];

    if (activeFilter === "all") {
      displayNotes = displayNotes.filter(n => !n.isArchived && !n.isTrashed);
    } else if (activeFilter === "starred") {
      displayNotes = displayNotes.filter(n => n.isStarred && !n.isArchived && !n.isTrashed);
    } else if (activeFilter === "archived") {
      displayNotes = displayNotes.filter(n => n.isArchived && !n.isTrashed);
    } else if (activeFilter === "trash") {
      displayNotes = displayNotes.filter(n => n.isTrashed);
    } else { 
      displayNotes = displayNotes.filter(n => n.tags.includes(activeFilter) && !n.isArchived && !n.isTrashed);
    }

    if (searchTerm) {
      displayNotes = displayNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return displayNotes.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchTerm, activeFilter]);

  if (!isClient) {
    return (
      <div className="flex h-full animate-pulse">
        <aside className="w-56 p-4 border-r hidden md:block bg-muted/30 dark:bg-muted/10">
          <Skeleton className="h-9 w-full rounded-lg mb-6" />
          {[...Array(4)].map((_, i) => <Skeleton key={`sk-cat-${i}`} className="h-8 w-full rounded-md mb-2" />)}
          <Skeleton className="h-px w-full my-4 bg-border" />
          <Skeleton className="h-6 w-1/2 rounded-md mb-3" />
          {[...Array(3)].map((_, i) => <Skeleton key={`sk-tag-${i}`} className="h-7 w-full rounded-md mb-2" />)}
        </aside>
        <main className="flex-1 p-4 md:p-6 space-y-6">
            <div className="flex justify-between items-center">
                 <Skeleton className="h-9 w-1/3 rounded-lg" />
                 <Skeleton className="h-9 w-48 rounded-lg" />
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl bg-muted" />)}
          </div>
        </main>
      </div>
    );
  }

  const SidebarButton = ({ label, icon, filterValue, count }: { label: string, icon: React.ReactNode, filterValue: ActiveFilter, count?: number }) => (
    <Button
      variant={activeFilter === filterValue ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start h-9 px-2.5 rounded-lg text-sm",
        activeFilter === filterValue ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
      )}
      onClick={() => setActiveFilter(filterValue)}
    >
      {icon}
      <span className="ml-2 flex-1 truncate">{label}</span>
      {count !== undefined && (
        <span className={cn("text-xs px-1.5 py-0.5 rounded-md", activeFilter === filterValue ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground/80 dark:bg-muted/50")}>{count}</span>
      )}
    </Button>
  );

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-0px)] bg-section-background dark:bg-background">
      <aside className="w-56 p-4 border-r hidden md:flex flex-col bg-card dark:bg-card/80">
        <ScrollArea className="flex-1 -mx-4">
            <div className="px-4 space-y-1">
                <SidebarButton label="All Notes" icon={<Folder className="h-4 w-4"/>} filterValue="all" count={notes.filter(n => !n.isArchived && !n.isTrashed).length}/>
                <SidebarButton label="Starred" icon={<StarIcon className="h-4 w-4"/>} filterValue="starred" count={notes.filter(n => n.isStarred && !n.isArchived && !n.isTrashed).length}/>
                <SidebarButton label="Archived" icon={<ArchiveIcon className="h-4 w-4"/>} filterValue="archived" count={notes.filter(n => n.isArchived && !n.isTrashed).length}/>
                <SidebarButton label="Trash" icon={<TrashIcon className="h-4 w-4"/>} filterValue="trash" count={notes.filter(n => n.isTrashed).length}/>
            </div>
            {allTags.length > 0 && (
                <>
                    <hr className="my-4 border-border"/>
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2.5 mb-2">Tags</h3>
                    <div className="px-4 space-y-1">
                    {allTags.map(tag => (
                        <SidebarButton 
                            key={tag} 
                            label={tag} 
                            icon={<TagIcon className="h-4 w-4"/>} 
                            filterValue={tag} 
                            count={notes.filter(n => n.tags.includes(tag) && !n.isArchived && !n.isTrashed).length}
                        />
                    ))}
                    </div>
                </>
            )}
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
         <div className="p-4 md:p-6 border-b bg-background dark:bg-muted/20">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold font-headline text-foreground">Notes</h1>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 rounded-xl h-10 w-full bg-muted/50 dark:bg-muted/30 focus:bg-background"
                    />
                </div>
             </div>
         </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            {filteredNotes.length > 0 ? (
              <div 
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                style={{ columnGap: '1rem' }} // Using column-gap for better control with CSS Grid
              >
                {filteredNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onToggleStar={handleToggleStar}
                    onToggleArchive={handleToggleArchive}
                    onToggleTrash={handleToggleTrash}
                    onRestore={handleRestoreFromTrash}
                    isTrashedView={activeFilter === 'trash'}
                    className="mb-4" // break-inside-avoid-column might not be fully supported by all browsers with CSS Grid
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height)-150px)]">
                <ThumbsUp className="mx-auto h-16 w-16 opacity-30 mb-4" />
                <p className="text-lg font-medium">
                  {searchTerm ? "No notes match your search" : 
                   activeFilter === "trash" ? "Trash is empty" :
                   activeFilter === "archived" ? "No archived notes" :
                   activeFilter === "starred" ? "No starred notes" :
                   activeFilter !== "all" ? `No notes found for tag "${activeFilter}"` :
                   "No notes yet!" }
                </p>
                <p className="text-sm">
                    {searchTerm || (activeFilter !== "all" && activeFilter !== "trash" && activeFilter !== "archived" && activeFilter !== "starred")  ? "Try adjusting your search or filters." : "Create a new note to get started."}
                </p>
                 {!searchTerm && activeFilter === "all" && (
                    <Button onClick={() => setIsDialogOpen(true)} className="mt-6 rounded-xl">
                        <PlusCircle className="mr-2 h-4 w-4"/> Create First Note
                    </Button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <AddNoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleSaveNote}
        noteToEdit={noteToEdit}
      />
    </div>
  );
}

