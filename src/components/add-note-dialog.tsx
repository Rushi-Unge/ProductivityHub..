
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Note } from "@/app/(authenticated)/notes/page";

const noteColorOptions = [
  { label: "Default", value: "default" },
  { label: "Yellow", value: "yellow" },
  { label: "Green", value: "green" },
  { label: "Blue", value: "blue" },
  { label: "Pink", value: "pink" },
  { label: "Purple", value: "purple" },
];

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title cannot exceed 100 characters." }),
  content: z.string().min(1, { message: "Content is required." }).max(5000, { message: "Content cannot exceed 5000 characters." }),
  color: z.string().optional(),
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
      color: "default",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        noteToEdit
          ? {
              title: noteToEdit.title,
              content: noteToEdit.content,
              color: noteToEdit.color || "default",
            }
          : {
              title: "",
              content: "",
              color: "default",
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
          <DialogTitle>{noteToEdit ? "Edit Note" : "Add New Note"}</DialogTitle>
          <DialogDescription>
            {noteToEdit ? "Update the details of your note." : "Fill in the details for your new note."}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value || "default"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {noteColorOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            <span 
                              className={`w-3 h-3 rounded-full mr-2 inline-block ${
                                option.value === "default" ? "bg-card border" :
                                option.value === "yellow" ? "bg-yellow-300" :
                                option.value === "green" ? "bg-green-300" :
                                option.value === "blue" ? "bg-blue-300" :
                                option.value === "pink" ? "bg-pink-300" :
                                option.value === "purple" ? "bg-purple-300" : ""
                              }`}
                            ></span>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
