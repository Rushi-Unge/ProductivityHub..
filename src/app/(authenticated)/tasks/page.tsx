
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Brain } from "lucide-react";
import TaskCard from "@/components/task-card";
import AddTaskDialog from "@/components/add-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { aiTaskPrioritization, type AiTaskPrioritizationInput, type AiTaskPrioritizationOutput } from "@/ai/flows/ai-task-prioritization";
import { Skeleton } from "@/components/ui/skeleton";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string date
  priority?: 'low' | 'medium' | 'high' | string;
  status: 'pending' | 'completed';
  aiReason?: string; // For AI prioritization
  aiPriority?: number; // For AI prioritization
}

// Dummy tasks
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
    // Potentially load tasks from localStorage or API here
  }, []);
  
  const handleAddTask = (taskData: Omit<Task, 'id' | 'status'>, id?: string) => {
    if (id) { // Editing task
      setTasks(tasks.map(t => t.id === id ? { ...t, ...taskData, dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined } : t));
      toast({ title: "Task Updated", description: `"${taskData.title}" has been updated.` });
    } else { // Adding new task
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(), // Simple ID generation
        status: 'pending',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
      };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task Added", description: `"${newTask.title}" has been added.` });
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'pending' ? 'completed' : 'pending' } : t));
  };

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast({ title: "Task Deleted", variant: "destructive" });
  };
  
  const openNewTaskDialog = () => {
    setTaskToEdit(null);
    setIsDialogOpen(true);
  };

  const handleAiPrioritize = async () => {
    setIsLoadingAi(true);
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
        deadline: task.dueDate ? task.dueDate.split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 1 week if no due date
        importance: (task.priority || 'medium') as 'low' | 'medium' | 'high',
      })),
    };

    try {
      const result: AiTaskPrioritizationOutput = await aiTaskPrioritization(aiInput);
      const prioritizedTasks = result.prioritizedTasks;

      // Update existing tasks with AI priority and reason, keeping original IDs
      const updatedTasks = tasks.map(originalTask => {
        const aiData = prioritizedTasks.find(pt => pt.title === originalTask.title && pt.description === (originalTask.description || ""));
        if (aiData && originalTask.status === 'pending') {
          return {
            ...originalTask,
            aiPriority: aiData.priority,
            aiReason: aiData.reason,
            // Optionally update priority based on AI suggestion
            // priority: aiData.importance, 
          };
        }
        return originalTask;
      });

      // Sort tasks: AI prioritized pending tasks first, then other pending, then completed
      updatedTasks.sort((a, b) => {
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status === 'completed') return 0; // or sort by completion date

        // Both pending
        if (a.aiPriority !== undefined && b.aiPriority !== undefined) {
          return a.aiPriority - b.aiPriority;
        }
        if (a.aiPriority !== undefined) return -1; // a is prioritized, b is not
        if (b.aiPriority !== undefined) return 1;  // b is prioritized, a is not
        
        // Fallback sort for non-AI prioritized pending tasks (e.g., by due date)
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dateA - dateB;
      });
      
      setTasks(updatedTasks);
      toast({ title: "Tasks Prioritized by AI", description: "Your tasks have been reordered based on AI suggestions." });
    } catch (error) {
      console.error("AI Prioritization Error:", error);
      toast({ title: "AI Error", description: "Could not prioritize tasks. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  const today = new Date().toISOString().split('T')[0];
  const upcomingTasks = pendingTasks.filter(t => t.dueDate && t.dueDate > today);
  const todayTasks = pendingTasks.filter(t => t.dueDate && t.dueDate.startsWith(today));
  // Tasks without due date or due date in the past (not today) can be considered under 'Today' or a general bucket
  const otherPendingTasks = pendingTasks.filter(t => !t.dueDate || (t.dueDate <= today && !t.dueDate.startsWith(today)) );


  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-8 w-full max-w-sm" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-60 w-full" />)}
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Task Manager</h1>
          <p className="text-muted-foreground">Organize, prioritize, and conquer your to-do list.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAiPrioritize} disabled={isLoadingAi}>
            <Brain className="mr-2 h-4 w-4" /> {isLoadingAi ? "Prioritizing..." : "Prioritize with AI"}
          </Button>
          <Button onClick={openNewTaskDialog}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="today">Today ({todayTasks.length + otherPendingTasks.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTasks.length})</TabsTrigger>
        </TabsList>
        
        {isLoadingAi && (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
             {[1,2,3].map(i => <Skeleton key={i} className="h-60 w-full" />)}
           </div>
        )}

        {!isLoadingAi && (
        <>
          <TabsContent value="today">
            <TaskGrid tasks={[...todayTasks, ...otherPendingTasks]} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} title="Tasks for Today & Overdue/Unscheduled" />
          </TabsContent>
          <TabsContent value="upcoming">
            <TaskGrid tasks={upcomingTasks} onToggleComplete={handleToggleComplete} onEdit={handleEditTask} onDelete={handleDeleteTask} title="Upcoming Tasks" />
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
    return <p className="text-muted-foreground text-center py-8">No tasks in this category.</p>;
  }
  return (
    <div className="space-y-4">
      {/* <h2 className="text-xl font-semibold mb-4">{title}</h2> */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} {...props} />
        ))}
      </div>
    </div>
  );
}

