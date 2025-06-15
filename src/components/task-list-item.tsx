
"use client"

import type { Task } from "@/app/(authenticated)/tasks/page";
import { cn } from "@/lib/utils";
import { format, parseISO, isToday, isTomorrow, formatDistanceToNowStrict } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit3, Trash2, CalendarDays, AlertTriangle, Zap, Info, Tag, CornerDownRight } from "lucide-react";

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
    if (isToday(date)) return `Today, ${format(date, "p")}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, "p")}`;
    return format(date, "MMM d, yyyy 'at' p");
  };

  const getPriorityBadgeInfo = (priority: Task['priority']) => {
    switch (priority) {
      case "high":
        return { icon: <Zap className="h-3.5 w-3.5 mr-1"/>, label: "High", variant: "destructive" as const, className: "bg-destructive/10 text-destructive border-destructive/20" };
      case "medium":
        return { icon: <AlertTriangle className="h-3.5 w-3.5 mr-1"/>, label: "Medium", variant: "warning" as const, className: "bg-warning/10 text-warning-foreground border-warning/30" };
      case "low":
        return { icon: <Info className="h-3.5 w-3.5 mr-1"/>, label: "Low", variant: "info" as const, className: "bg-info/10 text-info-foreground border-info/30" };
      default:
        return null;
    }
  };
  
  const priorityInfo = getPriorityBadgeInfo(task.priority);
  const dueDateDisplay = formatDateDisplay(task.dueDate);
  const completedAtText = task.status === 'completed' && task.completedAt 
    ? `Completed ${formatDistanceToNowStrict(parseISO(task.completedAt), { addSuffix: true })}`
    : null;

  return (
    <div className={cn(
        "flex items-start p-3.5 border rounded-xl transition-all duration-150 ease-in-out group shadow-sm",
        task.status === 'completed' ? "bg-muted/40 dark:bg-muted/20 border-border/30" : "bg-card hover:shadow-md hover:border-primary/40",
        task.aiReason && task.status === 'pending' ? "border-primary/40 bg-primary/5" : "border-border"
      )}>
      <Checkbox
        id={`task-${task.id}`}
        checked={task.status === 'completed'}
        onCheckedChange={() => onToggleComplete(task.id)}
        className="mr-3 mt-1 rounded-sm transition-transform group-hover:scale-105 flex-shrink-0"
        aria-label={`Mark task "${task.title}" as ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
            "font-medium text-sm leading-snug",
            task.status === 'completed' ? "line-through text-muted-foreground" : "text-card-foreground"
        )}>
            {task.title}
        </p>
        {task.description && task.status === 'pending' && (
             <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center flex-wrap gap-x-2.5 gap-y-1.5 text-xs text-muted-foreground mt-2">
            {dueDateDisplay && task.status === 'pending' && (
                <span className="flex items-center">
                    <CalendarDays className="h-3.5 w-3.5 mr-1 opacity-70" /> {dueDateDisplay}
                </span>
            )}
            {completedAtText && (
                 <span className="flex items-center">
                    <CalendarDays className="h-3.5 w-3.5 mr-1 opacity-70" /> {completedAtText}
                </span>
            )}
            {priorityInfo && task.status === 'pending' && (
                <Badge variant={priorityInfo.variant} className={cn("capitalize text-[10px] px-1.5 py-0.5 rounded-md font-medium", priorityInfo.className)}>
                   {priorityInfo.icon} {priorityInfo.label}
                </Badge>
            )}
            {task.tags && task.tags.length > 0 && task.status === 'pending' && task.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="capitalize text-[10px] px-1.5 py-0.5 rounded-md bg-muted hover:bg-muted/80 font-medium">
                   <Tag className="h-3 w-3 mr-1 opacity-70"/> {tag}
                </Badge>
            ))}
        </div>
         {task.aiReason && task.status === 'pending' && (
          <div className="mt-2.5 pt-2 border-t border-dashed border-primary/20">
            <p className="text-xs text-primary/90 flex items-start">
                <CornerDownRight className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0 text-primary/70"/> 
                <span className="font-semibold">AI (P{task.aiPriority}):</span>
                <span className="ml-1">{task.aiReason}</span>
            </p>
          </div>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 rounded-full flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
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

