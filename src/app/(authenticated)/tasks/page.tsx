
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Brain, ListChecks, CheckSquare, ThumbsUp } from "lucide-react";
import TaskCard from "@/components/task-card";
import AddTaskDialog from "@/components/add-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { aiTaskPrioritization, type AiTaskPrioritizationInput, type AiTaskPrioritizationOutput } from "@/ai/flows/ai-task-prioritization";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string date
  priority?: 'low' | 'medium' | 'high' | string;
  status: 'pending' | 'completed';
  aiReason?: string; 
  aiPriority?: number; 
}

const initialTasks: Task[] = [
  { id: "1", title: "Submit quarterly report", description: "Finalize and submit the Q3 financial report.", dueDate: "2024-08-10", priority: "high", status: "pending" },
  { id: "2", title: "Plan team retreat", description: "Organize logistics for the upcoming team building event.", dueDate: "2024-09-15", priority: "medium", status: "pending" },
  { id: "3", title: "Update website FAQs", description: "Review and update the FAQ section based on recent customer queries.", dueDate: "2024-08-05", priority: "low", status: "completed" },
  { id: "4", title: "Client onboarding call", description: "Onboard new client Acme Corp.", dueDate: "2024-08-01", priority: "high", status: "pending" },
  { id: "5", title: "Research new marketing tools", description: "Explore new tools for social media management.", dueDate: "2024-08-25", priority: "medium", status: "pending" },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleAddTask = (taskData: Omit<Task, 'id' | 'status' | 'aiReason' | 'aiPriority'>, id?: string) => {
    if (id) { 
      setTasks(tasks.map(t => t.id === id ? { ...t, ...taskData, dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined } : t));
      toast({ title: "Task Updated", description: `"${taskData.title}" has been updated.` });
    } else { 
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(), 
        status: 'pending',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
      };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task Added", description: `"${newTask.title}" has been added.` });
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending', aiReason: undefined, aiPriority: undefined } : t));
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    const deletedTask = tasks.find(t => t.id === id);
    setTasks(tasks.filter(t => t.id !== id));
    if (deletedTask) {
      toast({ title: "Task Deleted", description: `"${deletedTask.title}" was removed.`, variant: "destructive" });
    }
  };
  
  const openNewTaskDialog = () => {
    setTaskToEdit(null);
    setIsDialogOpen(true);
  };

  const handleAiPrioritize = async () => {
    setIsLoadingAi(true);
    toast({ title: "AI Prioritization Started", description: "The AI is analyzing your pending tasks..." });
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    if (pendingTasks.length === 0) {
      toast({ title: "No Pending Tasks", description: "There are no pending tasks to prioritize." });
      setIsLoadingAi(false);
      return;
    }

    const aiInput: AiTaskPrioritizationInput = {
      tasks: pendingTasks.map(task => ({
        title: task.title,
        description: task.description || "",
        deadline: task.dueDate ? task.dueDate.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        importance: (task.priority && ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium') as 'low' | 'medium' | 'high',
      })),
    };

    try {
      const result: AiTaskPrioritizationOutput = await aiTaskPrioritization(aiInput);
      const prioritizedTasks = result.prioritizedTasks;

      const updatedTasks = tasks.map(originalTask => {
        const aiData = prioritizedTasks.find(pt => pt.title === originalTask.title && pt.description === (originalTask.description || ""));
        if (aiData && originalTask.status === 'pending') {
          return {
            ...originalTask,
            aiPriority: aiData.priority,
            aiReason: aiData.reason,
          };
        }
        return {...originalTask, aiReason: undefined, aiPriority: undefined}; 
      });

      updatedTasks.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status === 'completed') {
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            return dateB - dateA; 
        }
        if (a.aiPriority !== undefined && b.aiPriority !== undefined) {
          return a.aiPriority - b.aiPriority;
        }
        if (a.aiPriority !== undefined) return -1; 
        if (b.aiPriority !== undefined) return 1;  
        
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity; 
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        if (dateA !== dateB) return dateA - dateB; 

        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 4);
      });
      
      setTasks(updatedTasks);
      toast({ title: "Tasks Prioritized by AI", description: "Your tasks have been reordered and annotated." });
    } catch (error) {
      console.error("AI Prioritization Error:", error);
      toast({ title: "AI Error", description: "Could not prioritize tasks. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const pendingTasksOriginal = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed').sort((a,b) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
    return dateB - dateA; 
  });
  
  const allPendingTasksSorted = [...pendingTasksOriginal].sort((a, b) => {
      if (a.aiPriority !== undefined && b.aiPriority !== undefined) return a.aiPriority - b.aiPriority;
      if (a.aiPriority !== undefined) return -1; 
      if (b.aiPriority !== undefined) return 1;  
      
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      if (dateA !== dateB) return dateA - dateB;

      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 4);
  });


  if (!isClient) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Skeleton className="h-10 w-full sm:w-40 rounded-xl" />
            <Skeleton className="h-10 w-full sm:w-32 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-xs sm:max-w-sm rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const tasksToShowInPending = isLoadingAi ? [] : allPendingTasksSorted;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Task Manager</h1>
          <p className="text-muted-foreground">Organize, prioritize, and conquer your to-do list.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={handleAiPrioritize} disabled={isLoadingAi || pendingTasksOriginal.length === 0} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow rounded-xl">
            <Brain className="mr-2 h-4 w-4" /> {isLoadingAi ? "AI Thinking..." : "Prioritize with AI"}
          </Button>
          <Button onClick={openNewTaskDialog} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow rounded-xl">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className={cn("grid w-full grid-cols-2 mb-4 bg-muted/50 dark:bg-muted/20 rounded-xl p-1 max-w-xs sm:max-w-sm")}>
          <TabsTrigger value="pending" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md rounded-lg"><ListChecks className="h-4 w-4"/>Pending ({pendingTasksOriginal.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-md rounded-lg"><CheckSquare className="h-4 w-4"/>Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        {isLoadingAi && (
           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-4">
             {Array.from({length: Math.min(pendingTasksOriginal.length, 4)}).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
           </div>
        )}

        {!isLoadingAi && (
        <>
          <TabsContent value="pending">
            <TaskGrid tasks={tasksToShowInPending} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} title="Pending Tasks" />
          </TabsContent>
          <TabsContent value="completed">
            <TaskGrid tasks={completedTasks} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} title="Completed Tasks" />
          </TabsContent>
        </>
        )}
      </Tabs>

      <AddTaskDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleAddTask} taskToEdit={taskToEdit} />
    </div>
  );
}

interface TaskGridProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  title: string;
}

function TaskGrid({ tasks, title, ...props }: TaskGridProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <ThumbsUp className="mx-auto h-20 w-20 opacity-30" />
        <p className="mt-6 text-xl font-medium">All caught up!</p>
        <p className="text-sm">No tasks in this category right now.</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} {...props} />
        ))}
      </div>
    </div>
  );
}
