
"use client"

import type { Task } from "@/app/(authenticated)/tasks/page";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isTomorrow, formatDistanceToNowStrict } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, GripVertical, CalendarDays, AlertTriangle, Zap, Info, Tag } from "lucide-react";

interface TaskListItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskListItem({ task, onToggleComplete, onEdit, onDelete }: TaskListItemProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = parseISO(dateString);
    if (isToday(date)) return `Today ${format(date, "p")}`;
    if (isTomorrow(date)) return `Tomorrow ${format(date, "p")}`;
    return format(date, "MMM d, p");
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="bg-red-100 text-red-700 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700/50"><Zap className="h-3.5 w-3.5 mr-1"/>High</Badge>;
      case "medium":
        return <Badge variant="warning" className="bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700/50"><AlertTriangle className="h-3.5 w-3.5 mr-1"/>Medium</Badge>;
      case "low":
        return <Badge variant="info" className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700/50"><Info className="h-3.5 w-3.5 mr-1"/>Low</Badge>;
      default:
        return null;
    }
  };
  
  const completedAtText = task.status === 'completed' && task.completedAt 
    ? `Completed ${formatDistanceToNowStrict(parseISO(task.completedAt), { addSuffix: true })}`
    : null;

  return (
    <div className={cn(
        "flex items-center p-3 border rounded-xl transition-all duration-150 ease-in-out group",
        task.status === 'completed' ? "bg-muted/50 dark:bg-muted/30 border-border/50" : "bg-card hover:shadow-md hover:border-primary/30",
        task.aiReason && task.status === 'pending' ? "border-primary/30 bg-primary/5" : "border-border"
      )}>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.status === 'completed'}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="mr-3 rounded-sm transition-transform group-hover:scale-105"
        aria-label={`Mark task "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
      />
      {/* <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab group-hover:opacity-100 opacity-0 transition-opacity" /> */}
      <div className="flex-1 min-w-0">
        <p className={cn(
            "font-medium truncate text-sm",
            task.status === 'completed' ? "line-through text-muted-foreground" : "text-card-foreground"
        )}>
            {task.title}
        </p>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
            {task.dueDate && task.status === 'pending' && (
                <span className="flex items-center">
                    <CalendarDays className="h-3.5 w-3.5 mr-1" /> {formatDate(task.dueDate)}
                </span>
            )}
            {completedAtText && (
                 <span className="flex items-center">
                    <CalendarDays className="h-3.5 w-3.5 mr-1" /> {completedAtText}
                </span>
            )}
            {task.priority && task.status === 'pending' && getPriorityBadge(task.priority)}
            {task.tags && task.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="capitalize text-[10px] px-1.5 py-0.5 rounded-md bg-muted hover:bg-muted/80">
                   <Tag className="h-3 w-3 mr-0.5"/> {tag}
                </Badge>
            ))}
        </div>
         {task.aiReason && task.status === 'pending' && (
          <div className="mt-1.5">
            <p className="text-xs text-primary/90"><span className="font-semibold">AI Suggestion (P{task.aiPriority}):</span> {task.aiReason}</p>
          </div>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 rounded-full flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Task options</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
          <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
            <Edit3 className="mr-2 h-4 w-4" /> Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
