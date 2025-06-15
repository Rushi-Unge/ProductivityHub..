
"use client"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Star, Archive, Trash2, StickyNote, Tag as TagIcon, Check, FilterX } from "lucide-react";
import NoteCard from "@/components/note-card";
import AddNoteDialog from "@/components/add-note-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";


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
  imageUrl?: string;
  imageFilename?: string;
}

type NoteCategory = "all" | "starred" | "archived" | "trash";

const initialNotesData: Note[] = [
  { id: "n1", title: "Project Ideas for ProductivePro", content: "1. AI-driven task suggestions.\n2. Team collaboration module.\n3. Customizable dashboard widgets for Pro features.\n\n## Meeting Notes (2024-07-29)\n- Discussed ProductivePro v2 roadmap.\n- Key features: Advanced Notes, Trading Integrations.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), tags: ["project", "ideas", "productivepro"], isStarred: true, isArchived: false, isTrashed: false, imageUrl: "https://placehold.co/600x400.png", imageFilename: "mindmap.png" },
  { id: "n2", title: "Daily Journal - 2024-07-28", content: "### Morning Reflections\nFeeling productive today. Started with a good workout.\n\n### Afternoon Tasks\n- Worked on the Notes page design.\n- Reviewed PRs.\n\n### Evening Thoughts\nNeed to plan tomorrow's priorities.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), tags: ["journal", "daily"], isStarred: false, isArchived: false, isTrashed: false },
  { id: "n3", title: "Markdown Cheatsheet", content: "# H1\n## H2\n### H3\n\n*italic*\n**bold**\n\n- List item 1\n- List item 2\n\n1. Ordered item 1\n2. Ordered item 2\n\n`inline code`\n\n```javascript\nconsole.log('hello');\n```\n\n[link](https://example.com)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tags: ["markdown", "cheatsheet", "dev"], isStarred: true, isArchived: false, isTrashed: false },
  { id: "n4", title: "Archived Meeting Notes Q1", content: "Old meeting notes from Q1. No longer actively needed but kept for reference.", createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), tags: ["meeting", "archive"], isStarred: false, isArchived: true, isTrashed: false },
  { id: "n5", title: "Note to be deleted", content: "This note is intended for the trash.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), tags: ["temp"], isStarred: false, isArchived: false, isTrashed: true },
];


export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotesData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<NoteCategory>("all");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  useEffect(() => setIsClient(true), []);

  const handleAddOrUpdateNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isTrashed'> & { tagsString?: string }, id?: string) => {
    const noteTags = noteData.tagsString ? noteData.tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : noteData.tags || [];

    if (id) {
      setNotes(notes.map(n => n.id === id ? { ...n, ...noteData, tags: noteTags, updatedAt: new Date().toISOString() } : n));
      toast({ title: "Note Updated", description: `"${noteData.title}" has been updated.` });
    } else {
      const newNote: Note = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isArchived: false,
        isTrashed: false,
        tags: noteTags,
      };
      setNotes([newNote, ...notes]);
      toast({ title: "Note Added", description: `"${newNote.title}" has been added.` });
    }
  };

  const handleEditNote = (note: Note) => {
    setNoteToEdit(note);
    setIsDialogOpen(true);
  };

  const handleToggleStar = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isStarred: !n.isStarred, updatedAt: new Date().toISOString() } : n));
    toast({ title: notes.find(n => n.id ===id)?.isStarred ? "Note Unstarred" : "Note Starred" });
  };

  const handleToggleArchive = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isArchived: !n.isArchived, isTrashed: false, isStarred: n.isArchived ? n.isStarred : false, updatedAt: new Date().toISOString() } : n));
     toast({ title: notes.find(n => n.id ===id)?.isArchived ? "Note Unarchived" : "Note Archived" });
  };

  const handleToggleTrash = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      if (note.isTrashed) {
        setNotes(notes.filter(n => n.id !== id));
        toast({ title: "Note Permanently Deleted", variant: "destructive" });
      } else {
        setNotes(notes.map(n => n.id === id ? { ...n, isTrashed: true, isArchived: false, isStarred: false, updatedAt: new Date().toISOString() } : n));
        toast({ title: "Note Moved to Trash" });
      }
    }
  };

  const handleRestoreFromTrash = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isTrashed: false, updatedAt: new Date().toISOString() } : n));
    toast({ title: "Note Restored" });
  };

  const openNewNoteDialog = () => {
    setNoteToEdit(null);
    setIsDialogOpen(true);
  };

  const allUniqueTags = useMemo(() => {
    const tagsSet = new Set<string>();
    notes.filter(n => !n.isTrashed).forEach(note => note.tags.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [notes]);

  const toggleTagFilter = (tagToToggle: string) => {
    setActiveCategory("all"); 
    setActiveTags(prev =>
      prev.includes(tagToToggle)
        ? prev.filter(t => t !== tagToToggle)
        : [...prev, tagToToggle]
    );
  };

  const clearTagFilters = () => {
    setActiveTags([]);
  }

  const filteredAndSortedNotes = useMemo(() => {
    let processedNotes = [...notes];

    switch (activeCategory) {
      case "starred":
        processedNotes = processedNotes.filter(note => note.isStarred && !note.isTrashed && !note.isArchived);
        break;
      case "archived":
        processedNotes = processedNotes.filter(note => note.isArchived && !note.isTrashed);
        break;
      case "trash":
        processedNotes = processedNotes.filter(note => note.isTrashed);
        break;
      case "all":
      default:
        processedNotes = processedNotes.filter(note => !note.isArchived && !note.isTrashed);
        break;
    }

    if (searchTerm) {
      processedNotes = processedNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (activeTags.length > 0 && activeCategory === "all") { 
      processedNotes = processedNotes.filter(note =>
        activeTags.every(activeTag => note.tags.includes(activeTag))
      );
    }

    // Default sort: Starred first, then by updatedAt descending
    processedNotes.sort((a, b) => {
      if (activeCategory !== "trash" && activeCategory !== "archived") {
        if (a.isStarred && !b.isStarred) return -1;
        if (!a.isStarred && b.isStarred) return 1;
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    return processedNotes;
  }, [notes, activeCategory, searchTerm, activeTags]);

  if (!isClient) {
    return (
      <div className="flex flex-col md:flex-row h-[calc(100vh-var(--header-height)-1px)]">
        <aside className="w-full md:w-60 p-4 border-b md:border-b-0 md:border-r bg-card dark:bg-card/80 space-y-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full rounded-lg" />)}
           <Skeleton className="h-6 w-1/2 rounded-lg mt-4" />
          {[...Array(2)].map((_, i) => <Skeleton key={i+4} className="h-6 w-full rounded-lg" />)}
        </aside>
        <main className="flex-1 p-4 md:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-xl hidden sm:block" />
            <Skeleton className="h-10 w-full sm:w-1/2 max-w-sm rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl hidden sm:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-56 w-full rounded-2xl" />)}
          </div>
        </main>
      </div>
    );
  }

  const sidebarLinkClasses = "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors";
  const activeSidebarLinkClasses = "bg-primary/10 text-primary dark:bg-primary/20";
  const inactiveSidebarLinkClasses = "hover:bg-muted dark:hover:bg-muted/50";

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-var(--header-height)-1px)]">
      <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r bg-card dark:bg-card/90 p-4 flex flex-col">
        <Button onClick={openNewNoteDialog} className="w-full mb-6 shadow-sm rounded-xl py-3 text-base bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-5 w-5" /> New Note
        </Button>
        <ScrollArea className="flex-grow md:h-[calc(100%-120px)]">
          <nav className="space-y-1.5">
            {(["all", "starred", "archived", "trash"] as NoteCategory[]).map(cat => {
              const count = cat === "all" ? notes.filter(n => !n.isArchived && !n.isTrashed).length :
                            cat === "starred" ? notes.filter(n => n.isStarred && !n.isArchived && !n.isTrashed).length :
                            cat === "archived" ? notes.filter(n => n.isArchived && !n.isTrashed).length :
                            notes.filter(n => n.isTrashed).length;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setActiveTags([]); }}
                  className={cn(
                    sidebarLinkClasses,
                    activeCategory === cat ? activeSidebarLinkClasses : inactiveSidebarLinkClasses,
                    "w-full justify-start"
                  )}
                >
                  {cat === "all" && <StickyNote className="h-5 w-5" />}
                  {cat === "starred" && <Star className="h-5 w-5" />}
                  {cat === "archived" && <Archive className="h-5 w-5" />}
                  {cat === "trash" && <Trash2 className="h-5 w-5" />}
                  <span className="capitalize">{cat}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted/70 text-muted-foreground dark:bg-muted/30 dark:text-muted-foreground/70">{count}</span>
                </button>
              );
            })}
          </nav>
          {allUniqueTags.length > 0 && (
            <>
              <DropdownMenuSeparator className="my-3"/>
              <div className="flex justify-between items-center px-3 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tags</h3>
                {activeTags.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearTagFilters} className="h-auto p-1 text-xs text-muted-foreground hover:text-primary">
                        <FilterX className="h-3 w-3 mr-1"/> Clear
                    </Button>
                )}
              </div>
              <nav className="space-y-1.5">
                {allUniqueTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTagFilter(tag)}
                    className={cn(
                      sidebarLinkClasses, "group",
                      activeTags.includes(tag) && activeCategory === "all" ? activeSidebarLinkClasses : inactiveSidebarLinkClasses,
                      "w-full justify-start relative"
                    )}
                  >
                    <TagIcon className="h-4 w-4" />
                    <span className="capitalize truncate flex-1 text-left">{tag}</span>
                    {activeTags.includes(tag) && activeCategory === "all" && <Check className="h-4 w-4 text-primary"/>}
                  </button>
                ))}
              </nav>
            </>
          )}
        </ScrollArea>
      </aside>

      <main className="flex-1 flex flex-col bg-background overflow-hidden">
        <header className="sticky top-0 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-b bg-card/95 dark:bg-card/80 backdrop-blur-sm">
          <h1 className="text-2xl font-bold text-foreground font-headline">Notes</h1>
          <div className="relative w-full sm:max-w-xs md:max-w-sm lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl shadow-sm bg-background focus:bg-card"
            />
          </div>
           <Button onClick={openNewNoteDialog} className="rounded-xl shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground hidden sm:flex">
              <Plus className="mr-2 h-5 w-5" /> New Note
            </Button>
            <Button onClick={openNewNoteDialog} size="icon" className="rounded-xl shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground sm:hidden">
              <Plus className="h-5 w-5" />
            </Button>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            {filteredAndSortedNotes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground min-h-[400px] flex flex-col justify-center items-center">
                <StickyNote className="mx-auto h-20 w-20 opacity-30 mb-4" />
                <p className="mt-6 text-xl font-medium">No notes found.</p>
                <p className="text-sm">
                  {activeCategory === 'trash' ? "Trash is empty." :
                   activeCategory === 'archived' ? "No archived notes." :
                   activeCategory === 'starred' ? "No starred notes." :
                   searchTerm || activeTags.length > 0 ? "Try adjusting your search or filters." :
                   "Create a new note to get started!"}
                </p>
                {(searchTerm || activeTags.length > 0) && (
                    <Button variant="outline" onClick={() => { setSearchTerm(""); setActiveTags([]); }} className="mt-4 rounded-xl">Clear Filters</Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedNotes.map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onToggleStar={handleToggleStar}
                    onToggleArchive={handleToggleArchive}
                    onToggleTrash={handleToggleTrash}
                    onRestore={handleRestoreFromTrash}
                    isTrashedView={activeCategory === 'trash'}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <AddNoteDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleAddOrUpdateNote}
        noteToEdit={noteToEdit}
      />
    </div>
  );
}
