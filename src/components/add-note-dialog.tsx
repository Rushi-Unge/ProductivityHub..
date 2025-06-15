
"use client"

// This component is no longer used for creating/editing notes.
// It's replaced by the NoteEditorDisplay panel.
// Keeping the file for now, but it can be deleted if not repurposed.

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Star, Tag as TagIcon } from "lucide-react";
import type { Note } from "@/app/(authenticated)/notes/page";
import { Switch } from "@/components/ui/switch";

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title cannot exceed 100 characters." }),
  content: z.string().max(10000, { message: "Content cannot exceed 10000 characters." }).optional(),
  tagsString: z.string().optional().describe("Comma-separated tags"),
  isStarred: z.boolean().default(false),
});

type NoteFormValues = Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isTrashed' | 'tags'> & { tagsString?: string };


interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (noteData: NoteFormValues & { tags: string[] }, id?: string) => void;
  noteToEdit?: Note | null;
}

export default function AddNoteDialog({ open, onOpenChange, onSave, noteToEdit }: AddNoteDialogProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      tagsString: "",
      isStarred: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        noteToEdit
          ? {
              title: noteToEdit.title,
              content: noteToEdit.content,
              tagsString: noteToEdit.tags?.join(', ') || "",
              isStarred: noteToEdit.isStarred || false,
            }
          : {
              title: "",
              content: "",
              tagsString: "",
              isStarred: false,
            }
      );
    }
  }, [open, noteToEdit, form]);

  const onSubmit = (data: NoteFormValues) => {
    const tagsArray = data.tagsString ? data.tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    const dataToSave: NoteFormValues & { tags: string[] } = {
        title: data.title,
        content: data.content || "",
        tags: tagsArray,
        isStarred: data.isStarred,
    };
    onSave(dataToSave, noteToEdit?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl rounded-2xl shadow-xl border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold text-foreground">
            {noteToEdit ? "Edit Note" : "Create New Note"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {noteToEdit ? "Update your note's details." : "Capture your thoughts and ideas."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} className="rounded-xl bg-input text-foreground focus:bg-background"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">Content (Markdown supported)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your note here..." {...field} rows={10} className="rounded-xl bg-input text-foreground focus:bg-background" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagsString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground"><TagIcon className="mr-1.5 h-4 w-4"/>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., work, ideas, journal" {...field} className="rounded-xl bg-input text-foreground focus:bg-background"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                control={form.control}
                name="isStarred"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm bg-muted/20 dark:bg-muted/10">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center text-foreground"><Star className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400"/>Star this note</FormLabel>
                            <DialogDescription className="text-xs text-muted-foreground">Starred notes are easier to find.</DialogDescription>
                        </div>
                        <FormControl>
                            <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary"
                            />
                        </FormControl>
                    </FormItem>
                )}
              />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-xl hover-scale">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground hover-scale">{noteToEdit ? "Save Changes" : "Create Note"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
