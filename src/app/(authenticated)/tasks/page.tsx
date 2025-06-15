
"use client"

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Brain, ListChecks, CheckSquare, ThumbsUp, CalendarDays, Search, GripVertical, Target } from "lucide-react";
import AddTaskDialog from "@/components/add-task-dialog";
import { useToast } from "@/hooks/use-toast";
import { aiTaskPrioritization, type AiTaskPrioritizationInput, type AiTaskPrioritizationOutput } from "@/ai/flows/ai-task-prioritization";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import TaskListItem from "@/components/task-list-item"; // New component
import { format, isToday, isTomorrow, parseISO } from "date-fns";


export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO string date
  priority?: 'low' | 'medium' | 'high' | string;
  status: 'pending' | 'completed';
  aiReason?: string;
  aiPriority?: number;
  tags?: string[];
  completedAt?: string; // ISO string for completion time
}

// Extended initialTasks with tags and more varied due dates
const initialTasks: Task[] = [
  { id: "1", title: "Review quarterly financial reports", description: "Finalize and submit the Q3 financial report. Ensure all data is cross-checked with the finance team and supporting documents are attached.", dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), priority: "high", status: "pending", tags: ["finance", "reporting"] , aiPriority: 1, aiReason: "Critical deadline approaching, high impact."},
  { id: "2", title: "Plan team retreat logistics", description: "Organize logistics for the upcoming team building event. This includes venue booking, catering, activities, and travel arrangements for all members.", dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(), priority: "medium", status: "pending", tags: ["event", "team"] },
  { id: "3", title: "Update website FAQ section", description: "Review and update the FAQ section based on recent customer queries and product updates. Coordinate with support team for common questions.", dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), priority: "low", status: "completed", tags: ["website", "content"], completedAt: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString() },
  { id: "4", title: "Onboard new client: Acme Corp", description: "Prepare presentation materials, system access, and initial project scope discussion points for Acme Corp onboarding.", dueDate: new Date().toISOString(), priority: "high", status: "pending", tags: ["client", "project"] },
  { id: "5", title: "Research new marketing automation tools", description: "Explore new tools for social media management, email marketing automation, and analytics. Prepare a comparison report.", dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), priority: "medium", status: "pending", tags: ["research", "marketing"] },
  { id: "6", title: "Morning workout session", description: "Complete 30-minute cardio and strength training.", dueDate: new Date(new Date().setDate(new Date().getDate() -1)).toISOString(), priority: "low", status: "completed", tags: ["health", "personal"], completedAt: new Date(new Date().setDate(new Date().getDate() -1)).toISOString() },
  { id: "7", title: "Submit design mockups for app", description: "Finalize and submit all design mockups for the new mobile application.", dueDate: new Date().toISOString(), priority: "high", status: "pending", tags: ["design", "app"], aiPriority: 2, aiReason: "Project milestone, time-sensitive."},
];


const mockFocusTasks = [
    {id: "f1", title: "Review quarterly reports", detail: "2 hours remaining", priority: "High"},
    {id: "f2", title: "Design system updates", detail: "High priority", priority: "High"},
];


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "high" | "dueToday" | "completed">("all");


  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddTask = (taskData: Omit<Task, 'id' | 'status' | 'aiReason' | 'aiPriority' | 'completedAt'>, id?: string) => {
    if (id) {
      setTasks(tasks.map(t => t.id === id ? { ...t, ...taskData, dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined, tags: taskData.tags || [] } : t));
      toast({ title: "Task Updated", description: `"${taskData.title}" has been updated.` });
    } else {
      const newTask: Task = {
        ...taskData,
        id: Date.now().toString(),
        status: 'pending',
        dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
        tags: taskData.tags || [],
      };
      setTasks([newTask, ...tasks]);
      toast({ title: "Task Added", description: `"${newTask.title}" has been added.` });
    }
  };

  const handleToggleComplete = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newStatus = t.status === 'pending' ? 'completed' : 'pending';
        return {
          ...t,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          aiReason: undefined, // Clear AI reason when status changes
          aiPriority: undefined // Clear AI priority
        };
      }
      return t;
    }));
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

      setTasks(currentTasks => {
        const updatedTasks = currentTasks.map(originalTask => {
            const aiData = prioritizedTasks.find(pt => pt.title === originalTask.title); // Simplified matching
            if (aiData && originalTask.status === 'pending') {
            return {
                ...originalTask,
                aiPriority: aiData.priority,
                aiReason: aiData.reason,
            };
            }
            // Clear AI fields if not in AI result or not pending
            return {...originalTask, aiReason: undefined, aiPriority: undefined};
        });

        // Sort all tasks: pending first (sorted by AI then due date), then completed (by completion date)
        return updatedTasks.sort((a, b) => {
            if (a.status === 'pending' && b.status === 'completed') return -1;
            if (a.status === 'completed' && b.status === 'pending') return 1;

            if (a.status === 'pending' && b.status === 'pending') {
                if (a.aiPriority !== undefined && b.aiPriority !== undefined) return a.aiPriority - b.aiPriority;
                if (a.aiPriority !== undefined) return -1;
                if (b.aiPriority !== undefined) return 1;
                const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
                const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
                return dateA - dateB;
            }

            if (a.status === 'completed' && b.status === 'completed') {
                const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
                const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
                return dateB - dateA; // Newest completed first
            }
            return 0;
        });
      });

      toast({ title: "Tasks Prioritized by AI", description: "Your tasks have been reordered and annotated." });
    } catch (error) {
      console.error("AI Prioritization Error:", error);
      toast({ title: "AI Error", description: "Could not prioritize tasks. Please try again.", variant: "destructive" });
    } finally {
      setIsLoadingAi(false);
    }
  };


  const filteredAndSortedTasks = useMemo(() => {
    let processedTasks = [...tasks];

    // Apply search filter first
    if (searchTerm) {
      processedTasks = processedTasks.filter(task =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'high':
        processedTasks = processedTasks.filter(t => t.priority === 'high' && t.status === 'pending');
        break;
      case 'dueToday':
        processedTasks = processedTasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)) && t.status === 'pending');
        break;
      case 'completed':
        processedTasks = processedTasks.filter(t => t.status === 'completed');
        break;
      case 'all':
      default:
        processedTasks = processedTasks.filter(t => t.status === 'pending'); // 'All Tasks' now means all pending
        break;
    }
    
    // Sort logic based on status, AI priority (if applicable for pending), then due date
    return processedTasks.sort((a, b) => {
        if (a.status === 'pending' && b.status === 'completed') return -1;
        if (a.status === 'completed' && b.status === 'pending') return 1;
        
        if (a.status === 'pending') { // Sort pending tasks
            if (a.aiPriority !== undefined && b.aiPriority !== undefined) return a.aiPriority - b.aiPriority;
            if (a.aiPriority !== undefined) return -1;
            if (b.aiPriority !== undefined) return 1;

            const priorityOrder = { high: 1, medium: 2, low: 3, default: 4 };
            const aPrio = priorityOrder[a.priority as keyof typeof priorityOrder] || priorityOrder.default;
            const bPrio = priorityOrder[b.priority as keyof typeof priorityOrder] || priorityOrder.default;
            if (aPrio !== bPrio) return aPrio - bPrio;
            
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
            return dateA - dateB;
        }
        
        if (a.status === 'completed') { // Sort completed tasks by completion date
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateB - dateA; // Newest completed first
        }
        return 0;
    });
  }, [tasks, searchTerm, activeTab]);


  if (!isClient) {
    // Simplified Skeleton for initial load
    return (
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <div className="grid md:grid-cols-3 gap-6">
            <Skeleton className="md:col-span-1 h-64 rounded-2xl" />
            <Skeleton className="md:col-span-2 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Task Manager</h1>
          <p className="text-muted-foreground">Organize and prioritize your tasks efficiently.</p>
        </div>
        <div className="flex items-center gap-2">
             <Button variant="outline" className="rounded-xl hidden sm:flex">
                <CalendarDays className="mr-2 h-4 w-4" /> Calendar View
             </Button>
             <Button onClick={openNewTaskDialog} className="w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow rounded-xl">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Task
             </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Focus */}
        <div className="lg:col-span-1 space-y-4">
            <Card className="rounded-2xl shadow-lg bg-primary/5 border-primary/20">
                <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center text-primary">
                    <Target className="mr-2 h-5 w-5" /> Today's Focus
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                {mockFocusTasks.map(ft => (
                    <div key={ft.id} className="p-3 bg-card/80 rounded-xl border border-border/70">
                        <h4 className="font-medium text-sm text-card-foreground">{ft.title}</h4>
                        <p className="text-xs text-muted-foreground">{ft.detail}</p>
                    </div>
                ))}
                <Button variant="outline" className="w-full rounded-xl border-dashed border-primary/50 text-primary hover:bg-primary/10 hover:text-primary">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Focus Task
                </Button>
                </CardContent>
            </Card>
             <Button onClick={handleAiPrioritize} disabled={isLoadingAi || tasks.filter(t=>t.status === 'pending').length === 0} className="w-full shadow-md hover:shadow-lg transition-shadow rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                <Brain className="mr-2 h-4 w-4" /> {isLoadingAi ? "AI Thinking..." : "Prioritize with AI"}
            </Button>
        </div>

        {/* Right Column: Task List Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 justify-between">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 rounded-xl p-1 bg-muted/70 dark:bg-muted/40">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">All Tasks</TabsTrigger>
                <TabsTrigger value="high" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">High Priority</TabsTrigger>
                <TabsTrigger value="dueToday" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Due Today</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-auto sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <Input
                    type="search"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 rounded-xl h-10 w-full bg-muted/70 dark:bg-muted/40 focus:bg-card"
                />
            </div>
          </div>
          
          <Card className="rounded-2xl shadow-lg">
             <CardHeader className="pt-4 pb-2">
                <CardTitle className="text-base font-medium text-muted-foreground">
                    {activeTab === "all" && "Pending Tasks"}
                    {activeTab === "high" && "High Priority Tasks"}
                    {activeTab === "dueToday" && "Tasks Due Today"}
                    {activeTab === "completed" && "Completed Tasks"}
                </CardTitle>
             </CardHeader>
            <CardContent>
              {isLoadingAi && activeTab !== "completed" ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg"/>)}
                </div>
              ) : filteredAndSortedTasks.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <ThumbsUp className="mx-auto h-16 w-16 opacity-30" />
                  <p className="mt-4 text-lg font-medium">
                    {searchTerm ? "No tasks match your search." : "No tasks here!"}
                  </p>
                  <p className="text-sm">
                    {searchTerm ? "Try a different search term." : "Add a new task or check other filters."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAndSortedTasks.map(task => (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleAddTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
