
"use client"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, ArrowUpDown, Pin as PinIcon, Archive, Trash2, StickyNote, BookOpen, Tag, CalendarDays, GripVertical, List } from "lucide-react";
import NoteCard from "@/components/note-card";
import AddNoteDialog from "@/components/add-note-dialog"; // This will be used for editing and creating
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Keep Note interface, AddNoteDialog for now.
// Rich editor and calendar view are significant and will be placeholders or simplified.

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown content
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  color?: string; 
  imageUrl?: string;
  imageFilename?: string;
}

type NoteCategory = "all" | "pinned" | "archived" | "trash";
type SortOption = "updatedAt_desc" | "updatedAt_asc" | "createdAt_desc" | "createdAt_asc" | "title_asc" | "title_desc";

const initialNotesData: Note[] = [
  { id: "n1", title: "Project Ideas for ProHub", content: "1. AI-driven task suggestions.\n2. Team collaboration module.\n3. Customizable dashboard widgets for Pro features.\n\n## Meeting Notes (2024-07-29)\n- Discussed ProHub v2 roadmap.\n- Key features: Advanced Notes, Trading Integrations.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-yellow-200 dark:bg-yellow-700/30", tags: ["project", "ideas", "prohub"], isPinned: true, isArchived: false, isTrashed: false, imageUrl: "https://placehold.co/600x400.png", imageFilename: "mindmap.png" },
  { id: "n2", title: "Daily Journal - 2024-07-28", content: "### Morning Reflections\nFeeling productive today. Started with a good workout.\n\n### Afternoon Tasks\n- Worked on the Notes page design.\n- Reviewed PRs.\n\n### Evening Thoughts\nNeed to plan tomorrow's priorities.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-blue-200 dark:bg-blue-700/30", tags: ["journal", "daily"], isPinned: false, isArchived: false, isTrashed: false },
  { id: "n3", title: "Markdown Cheatsheet", content: "# H1\n## H2\n### H3\n\n*italic*\n**bold**\n\n- List item 1\n- List item 2\n\n1. Ordered item 1\n2. Ordered item 2\n\n`inline code`\n\n```javascript\nconsole.log('hello');\n```\n\n[link](https://example.com)", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), color: "bg-green-200 dark:bg-green-700/30", tags: ["markdown", "cheatsheet", "dev"], isPinned: false, isArchived: false, isTrashed: false },
  { id: "n4", title: "Archived Meeting Notes Q1", content: "Old meeting notes from Q1. No longer actively needed but kept for reference.", createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-card", tags: ["meeting", "archive"], isPinned: false, isArchived: true, isTrashed: false },
  { id: "n5", title: "Note to be deleted", content: "This note is intended for the trash.", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), color: "bg-pink-200 dark:bg-pink-700/30", tags: ["temp"], isPinned: false, isArchived: false, isTrashed: true },
];


export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotesData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<NoteCategory>("all");
  const [sortOption, setSortOption] = useState<SortOption>("updatedAt_desc");
  const [activeTags, setActiveTags] = useState<string[]>([]); // For filtering by tags

  useEffect(() => setIsClient(true), []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach(note => note.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [notes]);

  const handleAddOrUpdateNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isTrashed'> & { tagsString?: string }, id?: string) => {
    const noteTags = noteData.tagsString ? noteData.tagsString.split(',').map(tag => tag.trim()).filter(tag => tag) : noteData.tags || [];
    
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

  const handleTogglePin = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n));
    toast({ title: notes.find(n => n.id ===id)?.isPinned ? "Note Unpinned" : "Note Pinned" });
  };

  const handleToggleArchive = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isArchived: !n.isArchived, isTrashed: false, updatedAt: new Date().toISOString() } : n));
     toast({ title: notes.find(n => n.id ===id)?.isArchived ? "Note Unarchived" : "Note Archived" });
  };
  
  const handleToggleTrash = (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      if (note.isTrashed) { // If already in trash, permanently delete
        // Add confirmation dialog here in a real app
        setNotes(notes.filter(n => n.id !== id));
        toast({ title: "Note Permanently Deleted", variant: "destructive" });
      } else { // Move to trash
        setNotes(notes.map(n => n.id === id ? { ...n, isTrashed: true, isArchived: false, updatedAt: new Date().toISOString() } : n));
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

  const filteredAndSortedNotes = useMemo(() => {
    let processedNotes = [...notes];

    // Filter by category
    switch (activeCategory) {
      case "pinned":
        processedNotes = processedNotes.filter(note => note.isPinned && !note.isTrashed && !note.isArchived);
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

    // Filter by search term (basic title and content search)
    if (searchTerm) {
      processedNotes = processedNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by active tags (if any selected)
    if (activeTags.length > 0) {
        processedNotes = processedNotes.filter(note => 
            activeTags.every(activeTag => note.tags.includes(activeTag))
        );
    }


    // Sort
    processedNotes.sort((a, b) => {
      // Pinned notes always on top for "all" and "pinned" categories unless sorting by title
      if (activeCategory !== "trash" && activeCategory !== "archived" && !sortOption.startsWith("title")) {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
      }
      
      switch (sortOption) {
        case "updatedAt_desc": return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case "updatedAt_asc": return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        case "createdAt_desc": return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "createdAt_asc": return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "title_asc": return a.title.localeCompare(b.title);
        case "title_desc": return b.title.localeCompare(a.title);
        default: return 0;
      }
    });

    return processedNotes;
  }, [notes, activeCategory, searchTerm, sortOption, activeTags]);
  
  const toggleTagFilter = (tag: string) => {
    setActiveTags(prev => 
        prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };


  if (!isClient) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height)-1rem)]">
        {/* Sidebar Skeleton */}
        <aside className="w-64 p-4 border-r space-y-4 hidden md:block">
          <Skeleton className="h-10 w-full rounded-2xl" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <div className="pt-4"><Skeleton className="h-6 w-20 mb-2" /><Skeleton className="h-5 w-16" /></div>
        </aside>
        {/* Main Area Skeleton */}
        <main className="flex-1 p-4 md:p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-1/2 max-w-sm" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
          </div>
        </main>
      </div>
    );
  }

  const sidebarLinkClasses = "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors";
  const activeSidebarLinkClasses = "bg-primary/10 text-primary";
  const inactiveSidebarLinkClasses = "hover:bg-muted dark:hover:bg-muted/50";

  return (
    <div className="flex h-[calc(100vh-var(--header-height)-1px)]"> {/* -1px for border */}
      {/* Left Sidebar */}
      <aside className="w-60 md:w-72 border-r bg-card dark:bg-card/50 p-4 flex-col hidden md:flex">
        <Button onClick={openNewNoteDialog} className="w-full mb-6 shadow-md rounded-xl py-3 text-base">
          <Plus className="mr-2 h-5 w-5" /> New Note
        </Button>
        <ScrollArea className="flex-grow">
        <nav className="space-y-1.5">
          {(["all", "pinned", "archived", "trash"] as NoteCategory[]).map(cat => {
            const count = cat === "all" ? notes.filter(n => !n.isArchived && !n.isTrashed).length :
                          cat === "pinned" ? notes.filter(n => n.isPinned && !n.isArchived && !n.isTrashed).length :
                          cat === "archived" ? notes.filter(n => n.isArchived && !n.isTrashed).length :
                          notes.filter(n => n.isTrashed).length;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  sidebarLinkClasses,
                  activeCategory === cat ? activeSidebarLinkClasses : inactiveSidebarLinkClasses,
                  "w-full justify-start"
                )}
              >
                {cat === "all" && <StickyNote className="h-5 w-5" />}
                {cat === "pinned" && <PinIcon className="h-5 w-5" />}
                {cat === "archived" && <Archive className="h-5 w-5" />}
                {cat === "trash" && <Trash2 className="h-5 w-5" />}
                <span className="capitalize">{cat}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground dark:bg-muted/50 dark:text-muted-foreground/70">{count}</span>
              </button>
            );
          })}
          {/* Tags Section Placeholder */}
          <div className="pt-6">
            <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-4 w-4"/> Tags
            </h3>
            <div className="space-y-1 mt-1">
              {allTags.slice(0,5).map(tag => ( // Show first 5 tags as example
                <button 
                  key={tag} 
                  onClick={() => toggleTagFilter(tag)}
                  className={cn(sidebarLinkClasses, activeTags.includes(tag) ? activeSidebarLinkClasses : inactiveSidebarLinkClasses, "w-full justify-start")}
                >
                  <span className="h-2 w-2 rounded-full bg-primary/50 mr-1.5"></span> {/* Color dot placeholder */}
                  {tag}
                </button>
              ))}
              {allTags.length > 5 && <button className={cn(sidebarLinkClasses, inactiveSidebarLinkClasses, "text-xs")}>View all tags...</button>}
            </div>
          </div>
          {/* Journal Section Placeholder */}
          <div className="pt-6">
             <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="h-4 w-4"/> Journal
            </h3>
            <button className={cn(sidebarLinkClasses, inactiveSidebarLinkClasses, "w-full justify-start mt-1")}>Open Calendar View</button>
          </div>
        </nav>
        </ScrollArea>
      </aside>

      {/* Main Notes Area */}
      <main className="flex-1 flex flex-col bg-background dark:bg-section-background overflow-hidden">
        {/* Top Toolbar */}
        <header className="sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-card dark:bg-card/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl shadow-sm">
                  <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                  <DropdownMenuRadioItem value="updatedAt_desc">Last Modified (Newest)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="updatedAt_asc">Last Modified (Oldest)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="createdAt_desc">Date Created (Newest)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="createdAt_asc">Date Created (Oldest)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title_asc">Title (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="title_desc">Title (Z-A)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-xl shadow-sm">
                  <Filter className="mr-2 h-4 w-4" /> Filter Tags ({activeTags.length > 0 ? activeTags.length : 'All'})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
                 <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                 <DropdownMenuSeparator />
                 {allTags.length === 0 && <DropdownMenuItem disabled>No tags found</DropdownMenuItem>}
                 {allTags.map(tag => (
                    <DropdownMenuItem key={tag} onSelect={() => toggleTagFilter(tag)} className={cn("flex justify-between",activeTags.includes(tag) && "bg-primary/10")}>
                        <span>{tag}</span>
                        {activeTags.includes(tag) && <Check className="h-4 w-4 text-primary"/>}
                    </DropdownMenuItem>
                 ))}
                 {activeTags.length > 0 && <DropdownMenuSeparator/>}
                 {activeTags.length > 0 && <DropdownMenuItem onSelect={() => setActiveTags([])} className="text-destructive">Clear Filters</DropdownMenuItem>}
              </DropdownMenuContent>
            </DropdownMenu>
             {/* Mobile: New Note Button */}
            <Button onClick={openNewNoteDialog} className="md:hidden rounded-xl shadow-md" size="icon" aria-label="New Note">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        {/* Notes Grid */}
        <ScrollArea className="flex-1">
          <div className="p-4 md:p-6">
            {filteredAndSortedNotes.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <StickyNote className="mx-auto h-20 w-20 opacity-30" />
                <p className="mt-6 text-xl font-medium">No notes found.</p>
                <p className="text-sm">Try adjusting your filters or creating a new note.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedNotes.map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={handleEditNote} 
                    onTogglePin={handleTogglePin}
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

      {/* Add/Edit Note Dialog */}
      <AddNoteDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleAddOrUpdateNote} 
        noteToEdit={noteToEdit} 
      />
    </div>
  );
}

// Minimal NoteCard component (Full implementation will be in its own file)
// interface NoteCardProps { note: Note; onEdit: (note: Note) => void; onDelete: (id: string) => void; }
// const NoteCardMinimal: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => (
//   <div className="border p-4 rounded-2xl shadow-md bg-card">
//     <h3 className="font-semibold">{note.title}</h3>
//     <p className="text-sm line-clamp-3">{note.content}</p>
//     <div className="mt-2">
//       <Button variant="ghost" size="sm" onClick={() => onEdit(note)}>Edit</Button>
//       <Button variant="ghost" size="sm" onClick={() => onDelete(note.id)}>Delete</Button>
//     </div>
//   </div>
// );
