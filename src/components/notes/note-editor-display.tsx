
// This component is no longer used in the Google Keep-style notes page.
// The layout has been changed to a card grid, and editing is handled by AddNoteDialog.
// Keeping the file for now, but it can be deleted if not repurposed.

"use client"

import type { Note } from "@/app/(authenticated)/notes/page";
import MarkdownRenderer from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Edit3, Eye, Pin, PinOff, Save, Tag, Trash2, ArrowLeft } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";


interface NoteEditorDisplayProps {
  note: Note;
  onUpdateNote: (updatedNote: Note) => void;
  onToggleStar: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteNote: (id: string) => void; // This is for moving to trash
  onGoBack?: () => void; // Optional: For mobile view to go back to list
  isMobileView?: boolean; // Optional: To conditionally render elements like back button
}

export default function NoteEditorDisplay({
  note,
  onUpdateNote,
  onToggleStar,
  onToggleArchive,
  onDeleteNote,
  onGoBack,
  isMobileView = false,
}: NoteEditorDisplayProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tagsString, setTagsString] = useState(note.tags.join(", "));
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("preview");

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
    setTagsString(note.tags.join(", "));
    setActiveTab(note.content || note.title !== "Untitled Note" ? "preview" : "edit");
  }, [note]);

  const handleSave = useCallback(() => {
    const updatedTags = tagsString.split(",").map(t => t.trim().toLowerCase()).filter(t => t);
    onUpdateNote({ ...note, title, content, tags: updatedTags });
  }, [onUpdateNote, note, title, content, tagsString]);
 
  useEffect(() => {
    const handler = setTimeout(() => {
      if (title !== note.title || content !== note.content || tagsString !== note.tags.join(", ")) {
        // Auto-save is disabled, user must click save.
      }
    }, 1000); 
    return () => clearTimeout(handler);
  }, [title, content, tagsString, note, handleSave]);


  const formattedLastUpdated = format(parseISO(note.updatedAt), "MMM d, yyyy 'at' h:mm a");

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background dark:bg-muted/20">
      <header className="p-4 border-b flex items-center justify-between gap-2">
        {isMobileView && onGoBack && (
          <Button variant="ghost" size="icon" onClick={onGoBack} className="mr-2 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave} 
            placeholder="Note Title"
            className="text-xl font-semibold border-0 shadow-none focus-visible:ring-0 h-auto p-0 flex-grow bg-transparent"
        />
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => onToggleStar(note.id)} title={note.isStarred ? "Unpin" : "Pin"} className="rounded-lg text-muted-foreground hover:text-primary">
            {note.isStarred ? <PinOff className="h-4 w-4 text-primary" /> : <Pin className="h-4 w-4" />}
          </Button>
           <Button variant="ghost" size="icon" onClick={handleSave} title="Save Note" className="rounded-lg text-muted-foreground hover:text-primary">
            <Save className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-lg text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4"/></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl shadow-lg">
              <DropdownMenuItem onClick={() => onToggleArchive(note.id)} className="cursor-pointer">
                <Archive className="mr-2 h-4 w-4"/> {note.isArchived ? "Unarchive" : "Archive"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDeleteNote(note.id)} className="text-destructive focus:text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4"/> Move to Trash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="px-4 pt-1 pb-2 text-xs text-muted-foreground">
         Last updated: {formattedLastUpdated}
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")} className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
        <div className="flex justify-between items-center mb-2">
            <TabsList className="bg-muted/50 dark:bg-muted/30 rounded-lg p-0.5">
            <TabsTrigger value="edit" className="text-xs px-3 py-1 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"><Edit3 className="h-3.5 w-3.5 mr-1.5"/>Edit</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs px-3 py-1 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md"><Eye className="h-3.5 w-3.5 mr-1.5"/>Preview</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="edit" className="flex-1 overflow-hidden rounded-lg border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary bg-card">
          <ScrollArea className="h-full">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSave} 
              placeholder="Start writing your note..."
              className="w-full h-full p-4 resize-none border-0 shadow-none focus-visible:ring-0 text-base min-h-[300px] bg-transparent"
            />
          </ScrollArea>
        </TabsContent>
        <TabsContent value="preview" className="flex-1 overflow-hidden rounded-lg border bg-card">
          <ScrollArea className="h-full">
            <div className="prose dark:prose-invert max-w-none p-4 text-base">
              {content ? <MarkdownRenderer content={content} /> : <p className="text-muted-foreground italic">Nothing to preview. Start writing in the edit tab!</p>}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-2 mb-1.5">
            <Tag className="h-4 w-4 text-muted-foreground"/>
            <label htmlFor="note-tags" className="text-sm font-medium text-muted-foreground">Tags</label>
        </div>
        <Input
          id="note-tags"
          value={tagsString}
          onChange={(e) => setTagsString(e.target.value)}
          onBlur={handleSave} 
          placeholder="Add tags, comma-separated"
          className="rounded-xl h-9 bg-muted/50 focus:bg-background"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
            {note.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="capitalize rounded-md text-xs bg-secondary/70 hover:bg-secondary">
                    {tag}
                </Badge>
            ))}
        </div>
      </div>
    </div>
  );
}
