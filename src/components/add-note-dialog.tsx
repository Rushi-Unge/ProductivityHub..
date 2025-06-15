
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
import { UploadCloud, Star, Tag as TagIcon, Trash2 } from "lucide-react";
import type { Note } from "@/app/(authenticated)/notes/page";
import { Switch } from "@/components/ui/switch";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];

const noteFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title cannot exceed 100 characters." }),
  content: z.string().max(10000, { message: "Content cannot exceed 10000 characters." }).optional(),
  tagsString: z.string().optional().describe("Comma-separated tags"),
  isStarred: z.boolean().default(false),
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
  onSave: (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isTrashed'> & { tagsString?: string; tags: string[] }, id?: string) => void;
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
      tagsString: "",
      isStarred: false,
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
              tagsString: noteToEdit.tags?.join(', ') || "",
              isStarred: noteToEdit.isStarred || false,
              image: null, 
              imageFilename: noteToEdit.imageFilename,
              imageUrl: noteToEdit.imageUrl,
            }
          : {
              title: "",
              content: "",
              tagsString: "",
              isStarred: false,
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
      finalImageUrl = previewImageUrl || `https://placehold.co/300x200.png?text=${encodeURIComponent(finalImageFilename || "image")}`;
    } else if (!data.image && !noteToEdit?.imageUrl && !previewImageUrl) { 
        finalImageUrl = undefined;
        finalImageFilename = undefined;
    }


    const tagsArray = data.tagsString ? data.tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    const dataToSave: Omit<Note, 'id'|'createdAt'|'updatedAt'|'isArchived'|'isTrashed'> & {tagsString?: string, tags: string[]} = {
        title: data.title,
        content: data.content || "",
        tags: tagsArray,
        isStarred: data.isStarred,
        imageUrl: finalImageUrl,
        imageFilename: finalImageFilename,
    };
    onSave(dataToSave, noteToEdit?.id);
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      form.setValue("image", files, { shouldValidate: true });
      setSelectedFileName(file.name);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImageUrl(reader.result as string);
        form.setValue("imageUrl", reader.result as string); 
      };
      reader.readAsDataURL(file);

    } else {
      form.setValue("image", null, { shouldValidate: true });
      if (noteToEdit?.imageUrl && !form.getValues("image")) {
        setSelectedFileName(noteToEdit.imageFilename || null);
        setPreviewImageUrl(noteToEdit.imageUrl);
        form.setValue("imageUrl", noteToEdit.imageUrl);
      } else { 
        setSelectedFileName(null);
        setPreviewImageUrl(null);
        form.setValue("imageUrl", undefined);
      }
    }
  };
  
  const handleRemoveImage = () => {
    form.setValue("image", null, { shouldValidate: true });
    form.setValue("imageFilename", undefined);
    form.setValue("imageUrl", undefined);
    setSelectedFileName(null);
    setPreviewImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg md:max-w-xl lg:max-w-2xl rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-semibold">
            {noteToEdit ? "Edit Note" : "Create New Note"}
          </DialogTitle>
          <DialogDescription>
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Note title" {...field} className="rounded-xl"/>
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
                  <FormLabel>Content (Markdown supported)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Write your note here..." {...field} rows={10} className="rounded-xl" />
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
                  <FormLabel className="flex items-center"><TagIcon className="mr-1.5 h-4 w-4 text-muted-foreground"/>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., work, ideas, journal" {...field} className="rounded-xl"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Image (Optional, Max {MAX_FILE_SIZE_MB}MB)</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 rounded-xl">
                            <UploadCloud className="mr-2 h-4 w-4" /> {selectedFileName ? "Change Image" : "Upload Image"}
                            </Button>
                            <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                            onChange={handleFileChange}
                            />
                            {selectedFileName && <span className="text-sm text-muted-foreground truncate flex-1" title={selectedFileName}>{selectedFileName}</span>}
                            {(selectedFileName || previewImageUrl) && (
                                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage} className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4"/>
                                    <span className="sr-only">Remove image</span>
                                </Button>
                            )}
                        </div>
                        {previewImageUrl && (
                            <img src={previewImageUrl} alt="Preview" className="mt-2 max-h-40 w-auto rounded-lg border object-contain bg-muted/50" data-ai-hint={selectedFileName ? selectedFileName.split('.')[0] : "note image abstract"}/>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {form.formState.errors.image && <FormMessage>{form.formState.errors.image.message as string}</FormMessage>}
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isStarred"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl border p-3 shadow-sm bg-muted/20">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base flex items-center"><Star className="mr-2 h-4 w-4 text-yellow-500"/>Star this note</FormLabel>
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
                <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">{noteToEdit ? "Save Changes" : "Create Note"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
