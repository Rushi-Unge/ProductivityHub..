
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Task } from "@/app/(authenticated)/tasks/page";

const taskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tagsString: z.string().optional().describe("Comma-separated tags"),
});

// Deriving TaskFormValues to match the Task interface for saving
type TaskFormValues = Omit<Task, 'id' | 'status' | 'aiReason' | 'aiPriority' | 'tags' | 'completedAt' | 'dueDate'> & {
  dueDate?: Date;
  tagsString?: string;
};


interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (taskData: Omit<Task, 'id' | 'status' | 'aiReason' | 'aiPriority' | 'completedAt'>, id?: string) => void;
  taskToEdit?: Task | null;
}

export default function AddTaskDialog({ open, onOpenChange, onSave, taskToEdit }: AddTaskDialogProps) {
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: undefined,
      priority: 'medium',
      tagsString: "",
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        taskToEdit
          ? {
              title: taskToEdit.title,
              description: taskToEdit.description,
              dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate) : undefined,
              priority: taskToEdit.priority as 'low' | 'medium' | 'high' | undefined,
              tagsString: taskToEdit.tags?.join(', ') || ""
            }
          : {
              title: "",
              description: "",
              dueDate: undefined,
              priority: 'medium',
              tagsString: "",
            }
      );
    }
  }, [open, taskToEdit, form]);


  const onSubmit = (data: TaskFormValues) => {
    const tagsArray = data.tagsString ? data.tagsString.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    const dataToSave: Omit<Task, 'id' | 'status' | 'aiReason' | 'aiPriority' | 'completedAt'> = {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate?.toISOString(),
        priority: data.priority,
        tags: tagsArray,
    };
    onSave(dataToSave, taskToEdit?.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl shadow-xl">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Edit Task" : "Add New Task"}</DialogTitle>
          <DialogDescription>
            {taskToEdit ? "Update the details of your task." : "Fill in the details for your new task."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Finish project proposal" {...field} className="rounded-xl"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add more details about the task..." {...field} className="rounded-xl" rows={3}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                    <FormItem className="flex flex-col">
                    <FormLabel>Due Date (Optional)</FormLabel>
                    <Popover>
                        <PopoverTrigger asChild>
                        <FormControl>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full pl-3 text-left font-normal rounded-xl",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            {field.value ? (
                                format(field.value, "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 rounded-xl shadow-lg" align="start">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) }
                            initialFocus
                        />
                        </PopoverContent>
                    </Popover>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'medium'}>
                        <FormControl>
                        <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl shadow-lg">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="tagsString"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center"><Tag className="mr-1.5 h-4 w-4 text-muted-foreground"/>Tags (Optional, comma-separated)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., work, personal, urgent" {...field} className="rounded-xl"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="rounded-xl">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="rounded-xl">{taskToEdit ? "Save Changes" : "Add Task"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

