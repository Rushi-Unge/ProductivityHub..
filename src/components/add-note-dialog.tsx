
"use client"

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

// Form schema for the dialog
const noteDialogSchema = z.object({
  title: z.string().max(100, { message: "Title cannot exceed 100 characters." }).optional(), // Title is optional
  content: z.string().max(10000, { message: "Content cannot exceed 10000 characters." }).optional(),
  tagsString: z.string().optional().describe("Comma-separated tags"),
  isStarred: z.boolean().default(false),
});

// Type for form values, matching the schema
type NoteDialogFormValues = z.infer<typeof noteDialogSchema>;

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (noteData: NoteDialogFormValues, id?: string) => void; // Adjusted to use NoteDialogFormValues
  noteToEdit?: Note | null;
}

export default function AddNoteDialog({ open, onOpenChange, onSave, noteToEdit }: AddNoteDialogProps) {
  const form = useForm<NoteDialogFormValues>({
    resolver: zodResolver(noteDialogSchema),
    defaultValues: {
      title: "",
      content: "",
      tagsString: "",
      isStarred: false,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (noteToEdit) {
        form.reset({
          title: noteToEdit.title,
          content: noteToEdit.content,
          tagsString: noteToEdit.tags?.join(', ') || "",
          isStarred: noteToEdit.isStarred || false,
        });
      } else {
        // For new notes, title might be empty initially or set by "Take a note..."
        form.reset({
          title: "",
          content: "",
          tagsString: "",
          isStarred: false,
        });
      }
    }
  }, [open, noteToEdit, form]);

  const onSubmit = (data: NoteDialogFormValues) => {
    if (!data.title && !data.content && !data.tagsString) {
        onOpenChange(false); // Close dialog if everything is empty
        return;
    }
    onSave(data, noteToEdit?.id);
    // onOpenChange(false); // Let the parent decide to close
  };
  
  const handleOpenChangeWithCheck = (newOpenState: boolean) => {
    if (!newOpenState) { // If closing dialog
        const currentValues = form.getValues();
        if (currentValues.title || currentValues.content || currentValues.tagsString) {
            // If there's content, trigger save before closing
            form.handleSubmit(onSubmit)(); 
        }
    }
    onOpenChange(newOpenState);
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChangeWithCheck}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl rounded-2xl shadow-xl border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold text-foreground">
            {noteToEdit ? "Edit Note" : "Create New Note"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input 
                        placeholder="Title" 
                        {...field} 
                        className="rounded-xl bg-transparent text-foreground text-lg font-medium border-0 shadow-none focus-visible:ring-0 px-1 h-auto"
                    />
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
                  <FormControl>
                    <Textarea 
                        placeholder="Take a note..." 
                        {...field} 
                        rows={8} 
                        className="rounded-xl bg-transparent text-foreground border-0 shadow-none focus-visible:ring-0 px-1 min-h-[100px]" 
                    />
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
                  <FormLabel className="flex items-center text-muted-foreground text-xs px-1"><TagIcon className="mr-1.5 h-3.5 w-3.5"/>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., work, ideas" {...field} className="rounded-xl bg-input text-foreground focus:bg-background h-9 px-2"/>
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
                            <DialogDescription className="text-xs text-muted-foreground">Starred notes appear in a special filter.</DialogDescription>
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
              <Button 
                type="button" 
                onClick={() => {
                    form.handleSubmit(onSubmit)(); // Trigger save
                    onOpenChange(false); // Then close
                }} 
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground hover-scale">
                {noteToEdit ? "Done" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
