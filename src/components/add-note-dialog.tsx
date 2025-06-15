
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
import { Palette, Check } from "lucide-react";
import type { Note } from "@/app/(authenticated)/notes/page";
import { cn } from "@/lib/utils";

const noteColorOptions = [
  { label: "Default", value: "bg-card", name: "Default" },
  { label: "Yellow", value: "bg-yellow-200 dark:bg-yellow-700/30", name: "Yellow" },
  { label: "Green", value: "bg-green-200 dark:bg-green-700/30", name: "Green" },
  { label: "Blue", value: "bg-blue-200 dark:bg-blue-700/30", name: "Blue" },
  { label: "Pink", value: "bg-pink-200 dark:bg-pink-700/30", name: "Pink" },
  { label: "Purple", value: "bg-purple-200 dark:bg-purple-700/30", name: "Purple" },
  { label: "Orange", value: "bg-orange-200 dark:bg-orange-700/30", name: "Orange" },
];

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title cannot exceed 100 characters." }),
  content: z.string().min(1, { message: "Content is required." }).max(5000, { message: "Content cannot exceed 5000 characters." }),
  color: z.string().default("bg-card"),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (noteData: NoteFormValues, id?: string) => void;
  noteToEdit?: Note | null;
}

export default function AddNoteDialog({ open, onOpenChange, onSave, noteToEdit }: AddNoteDialogProps) {
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      color: "bg-card",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        noteToEdit
          ? {
              title: noteToEdit.title,
              content: noteToEdit.content,
              color: noteToEdit.color || "bg-card",
            }
          : {
              title: "",
              content: "",
              color: "bg-card",
            }
      );
    }
  }, [open, noteToEdit, form]);

  const onSubmit = (data: NoteFormValues) => {
    onSave(data, noteToEdit?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Palette className="mr-2 h-5 w-5 text-primary" />
            {noteToEdit ? "Edit Note" : "Add New Note"}
          </DialogTitle>
          <DialogDescription>
            {noteToEdit ? "Update the details and color of your note." : "Fill in the details and pick a color for your new note."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} />
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
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your note here..." {...field} rows={6} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note Color</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {noteColorOptions.map(option => (
                        <Button
                          type="button"
                          key={option.value}
                          variant="outline"
                          className={cn(
                            "h-8 w-8 rounded-full p-0 border-2",
                            field.value === option.value ? "border-primary ring-2 ring-primary ring-offset-2" : "border-muted",
                            option.value 
                          )}
                          onClick={() => field.onChange(option.value)}
                          title={option.name}
                        >
                          {field.value === option.value && <Check className="h-4 w-4 text-primary-foreground mix-blend-difference" />}
                           <span className="sr-only">{option.name}</span>
                        </Button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">{noteToEdit ? "Save Changes" : "Add Note"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
