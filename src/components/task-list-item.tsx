
"use client"

import type { Task } from "@/app/(authenticated)/tasks/page";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isTomorrow, formatDistanceToNowStrict, differenceInCalendarDays } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, CalendarDays, AlertTriangle, Zap, Info, Brain } from "lucide-react";

interface TaskListItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskListItem({ task, onToggleComplete, onEdit, onDelete }: TaskListItemProps) {
  const formatDateDisplay = (dateString?: string) => {
    if (!dateString) return null;
    const date = parseISO(dateString);
    const today = new Date();
    const diffDays = differenceInCalendarDays(date, today);

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays < 0) return `Overdue by ${formatDistanceToNowStrict(date, { addSuffix: true })}`;
    if (diffDays < 7) return format(date, "EEEE"); // e.g., Monday
    return format(date, "MMM d"); // e.g., Aug 10
  };

  const getPriorityBadgeInfo = (priority: Task['priority']) => {
    switch (priority) {
      case "high":
        return { icon: <Zap className="h-3 w-3 mr-1"/>, label: "High", variant: "destructive" as const, className: "bg-destructive/10 text-destructive border-destructive/20" };
      case "medium":
        return { icon: <AlertTriangle className="h-3 w-3 mr-1"/>, label: "Medium", variant: "warning" as const, className: "bg-warning/10 text-warning-foreground border-warning/30" };
      case "low":
        return { icon: <Info className="h-3 w-3 mr-1"/>, label: "Low", variant: "info" as const, className: "bg-info/10 text-info-foreground border-info/30" };
      default:
        return null;
    }
  };
  
  const priorityInfo = getPriorityBadgeInfo(task.priority);
  const dueDateDisplay = formatDateDisplay(task.dueDate);
  const completedAtText = task.status === 'completed' && task.completedAt 
    ? `Completed ${formatDistanceToNowStrict(parseISO(task.completedAt), { addSuffix: true })}`
    : null;

  const isAiPrioritized = task.aiPriority !== undefined && task.status === 'pending';

  return (
    <div className={cn(
        "flex items-start p-3 border rounded-xl transition-all duration-150 ease-in-out group shadow-sm",
        task.status === 'completed' ? "bg-muted/30 dark:bg-muted/10 border-border/20" : "bg-card hover:shadow-md hover:border-primary/30",
        isAiPrioritized ? "border-primary/30 bg-primary/5" : "border-border"
      )}>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.status === 'completed'}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="mr-3 mt-0.5 rounded-sm transition-transform group-hover:scale-105 flex-shrink-0"
        aria-label={`Mark task "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
            "font-medium text-sm leading-snug",
            task.status === 'completed' ? "line-through text-muted-foreground" : "text-card-foreground"
        )}>
            {task.title}
        </p>
        
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
            {dueDateDisplay && task.status === 'pending' && (
                <span className="flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1 opacity-60" /> {dueDateDisplay}
                </span>
            )}
            {completedAtText && (
                 <span className="flex items-center">
                    <CalendarDays className="h-3 w-3 mr-1 opacity-60" /> {completedAtText}
                </span>
            )}
            {priorityInfo && task.status === 'pending' && (
                <Badge variant={priorityInfo.variant} className={cn("capitalize text-[10px] px-1.5 py-0.5 rounded-md font-medium h-5", priorityInfo.className)}>
                   {priorityInfo.icon} {priorityInfo.label}
                </Badge>
            )}
            {isAiPrioritized && (
                 <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-medium h-5 border-primary/50 text-primary/80 bg-primary/10")}>
                   <Brain className="h-3 w-3 mr-1"/> AI Prio: {task.aiPriority}
                </Badge>
            )}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 rounded-lg flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
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
