
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
import { Palette, Check, UploadCloud } from "lucide-react";
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

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title cannot exceed 100 characters." }),
  content: z.string().min(1, { message: "Content is required." }).max(5000, { message: "Content cannot exceed 5000 characters." }),
  color: z.string().default("bg-card"),
  image: z.any()
    .optional()
    .refine(
        (fileList) => !fileList || fileList.length === 0 || fileList[0]?.size <= MAX_FILE_SIZE_BYTES,
        `Max image size is ${MAX_FILE_SIZE_MB}MB.`
    )
    .refine(
        (fileList) => !fileList || fileList.length === 0 || ACCEPTED_IMAGE_TYPES.includes(fileList[0]?.type),
        "Only .jpg, .jpeg, .png, .webp, .gif formats are supported."
    ),
  imageFilename: z.string().optional(),
  imageUrl: z.string().optional(),
});

type NoteFormValues = z.infer<typeof noteFormSchema>;

interface AddNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (noteData: NoteFormValues, id?: string) => void;
  noteToEdit?: Note | null;
}

export default function AddNoteDialog({ open, onOpenChange, onSave, noteToEdit }: AddNoteDialogProps) {
  const [selectedFileName, setSelectedFileName] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      color: "bg-card",
      image: null,
      imageFilename: undefined,
      imageUrl: undefined,
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
              image: null, // Do not pre-fill FileList
              imageFilename: noteToEdit.imageFilename,
              imageUrl: noteToEdit.imageUrl,
            }
          : {
              title: "",
              content: "",
              color: "bg-card",
              image: null,
              imageFilename: undefined,
              imageUrl: undefined,
            }
      );
      setSelectedFileName(noteToEdit?.imageFilename || null);
      setPreviewImageUrl(noteToEdit?.imageUrl || null);
    }
  }, [open, noteToEdit, form]);

  const onSubmit = (data: NoteFormValues) => {
    let finalImageFilename = data.imageFilename;
    let finalImageUrl = data.imageUrl;

    if (data.image && data.image.length > 0) {
      finalImageFilename = data.image[0].name;
      // For simulation, if previewImageUrl (data URI) is set, use it. Otherwise, use placeholder.
      finalImageUrl = previewImageUrl || `https://placehold.co/300x200.png?text=${encodeURIComponent(finalImageFilename || "image")}`;
    } else if (!data.image && !finalImageFilename) { // If file removed and no existing filename
        finalImageUrl = undefined;
    }


    onSave({ ...data, imageFilename: finalImageFilename, imageUrl: finalImageUrl }, noteToEdit?.id);
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      form.setValue("image", files, { shouldValidate: true });
      setSelectedFileName(file.name);

      // Generate a data URI for preview (client-side only)
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

    } else {
      form.setValue("image", null, { shouldValidate: true });
      setSelectedFileName(noteToEdit?.imageFilename && !form.getValues("image") ? noteToEdit.imageFilename : null);
      setPreviewImageUrl(noteToEdit?.imageUrl && !form.getValues("image") ? noteToEdit.imageUrl : null);
    }
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
            {noteToEdit ? "Update the details, color, or image of your note." : "Fill in the details, pick a color, and optionally add an image."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
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
            <FormField
                control={form.control}
                name="image"
                render={({ fieldState }) => (
                  <FormItem>
                    <FormLabel>Image (Optional, Max {MAX_FILE_SIZE_MB}MB)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0">
                            <UploadCloud className="mr-2 h-4 w-4" /> {selectedFileName ? "Change Image" : "Upload Image"}
                            </Button>
                            <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                            onChange={handleFileChange}
                            />
                            {selectedFileName && <span className="text-sm text-muted-foreground truncate" title={selectedFileName}>{selectedFileName}</span>}
                        </div>
                        {previewImageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewImageUrl} alt="Preview" className="mt-2 max-h-32 w-auto rounded-md border object-contain" data-ai-hint="note image user content"/>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {form.formState.errors.image && <FormMessage>{form.formState.errors.image.message}</FormMessage>}
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
