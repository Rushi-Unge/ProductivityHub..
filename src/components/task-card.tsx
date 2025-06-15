
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, CheckCircle, Circle, Zap, AlertTriangle, Info, CalendarDays } from "lucide-react";
import type { Task } from "@/app/(authenticated)/tasks/page"; 
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  
  const getPriorityStyles = (priority: 'low' | 'medium' | 'high' | string | undefined) => {
    switch (priority) {
      case 'low':
        return {
          variant: "info" as const, 
          icon: <Info className="mr-1.5 h-3.5 w-3.5" />,
          className: "bg-info/10 text-info-foreground border-info/30",
        };
      case 'medium':
        return {
          variant: "warning" as const,
          icon: <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />, 
          className: "bg-warning/10 text-warning-foreground border-warning/30",
        };
      case 'high':
        return {
          variant: "destructive" as const,
          icon: <Zap className="mr-1.5 h-3.5 w-3.5" />, 
          className: "bg-destructive/10 text-destructive-foreground border-destructive/30",
        };
      default:
        return {
          variant: "default" as const,
          icon: null,
          className: "",
        };
    }
  };
  
  const priorityStyles = getPriorityStyles(task.priority);
  
  return (
    <Card className={cn(
        "shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col rounded-2xl", 
        task.status === 'completed' ? 'opacity-70 bg-muted/50 dark:bg-muted/20' : 'bg-card hover:scale-[1.01]'
      )}>
      <CardHeader className="flex flex-row items-start justify-between pb-3 px-4 pt-4">
        <div className="space-y-1 flex-1 min-w-0 pr-2">
          <CardTitle className={cn(
              "text-lg font-semibold break-words", 
              task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-card-foreground'
            )}>
            {task.title}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl shadow-lg">
            <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-4 px-4 space-y-3 flex-grow">
        {task.description && (
            <CardDescription className="text-sm leading-relaxed line-clamp-3 text-muted-foreground">
              {task.description}
            </CardDescription>
        )}
        <div className="flex flex-wrap gap-2 items-center">
            {task.dueDate && (
            <Badge variant="outline" className="text-xs flex items-center rounded-lg py-1">
                <CalendarDays className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                Due: {format(parseISO(task.dueDate), "MMM d, yyyy")}
            </Badge>
            )}
            {task.priority && (
            <Badge variant={priorityStyles.variant} className={cn("capitalize text-xs flex items-center rounded-lg py-1", priorityStyles.className)}>
                {priorityStyles.icon}
                {task.priority}
            </Badge>
            )}
        </div>
         {task.aiReason && (
          <div className="mt-2 p-2.5 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-primary font-semibold">AI Suggestion (Priority {task.aiPriority}):</p>
            <p className="text-xs text-primary/80 mt-0.5">{task.aiReason}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 pb-4 px-4 border-t mt-auto">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`complete-${task.id}`}
            checked={task.status === 'completed'}
            onCheckedChange={() => onToggleComplete(task.id)}
            aria-label={task.status === 'completed' ? "Mark task as incomplete" : "Mark task as complete"}
            className="transition-transform hover:scale-110 rounded-sm"
          />
          <label
            htmlFor={`complete-${task.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            {task.status === 'completed' ? 'Completed' : 'Mark complete'}
          </label>
        </div>
        {task.status === 'completed' ? <CheckCircle className="h-5 w-5 text-success animate-pulse-subtle" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
      </CardFooter>
    </Card>
  );
}
