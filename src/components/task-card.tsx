
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, CheckCircle, Circle, Zap, AlertTriangle, Info } from "lucide-react";
import type { Task } from "@/app/(authenticated)/tasks/page"; // Assuming Task type is exported from tasks page
import { cn } from "@/lib/utils";

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
          variant: "outline" as const, // Or a custom variant if defined
          icon: <Info className="mr-1 h-3 w-3 text-info" />,
          className: "border-info text-info bg-info/10",
        };
      case 'medium':
        return {
          variant: "outline" as const, // Or a custom variant
          icon: <AlertTriangle className="mr-1 h-3 w-3 text-warning" />,
          className: "border-warning text-warning-foreground bg-warning/20",
        };
      case 'high':
        return {
          variant: "destructive" as const,
          icon: <Zap className="mr-1 h-3 w-3" />, // No specific class needed if variant destructive handles color
          className: "", // Relies on destructive variant for styling
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
        "shadow-md hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col", 
        task.status === 'completed' ? 'opacity-60 bg-muted/30' : 'bg-card hover:scale-[1.01]'
      )}>
      <CardHeader className="flex flex-row items-start justify-between pb-3 px-4 pt-4">
        <div className="space-y-1 flex-1 min-w-0">
          <CardTitle className={cn(
              "text-lg font-semibold break-words", 
              task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-card-foreground'
            )}>
            {task.title}
          </CardTitle>
          {task.description && (
            <CardDescription className="text-sm leading-relaxed line-clamp-2 text-muted-foreground">
              {task.description}
            </CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 ml-2 flex-shrink-0 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due: {new Date(task.dueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        )}
        {task.priority && (
          <Badge variant={priorityStyles.variant} className={cn("capitalize text-xs flex items-center w-fit", priorityStyles.className)}>
            {priorityStyles.icon}
            {task.priority}
          </Badge>
        )}
         {task.aiReason && (
          <div className="mt-2 p-2 bg-primary/10 rounded-md border border-primary/20">
            <p className="text-xs text-primary font-semibold">AI Suggestion:</p>
            <p className="text-xs text-primary/80">{task.aiReason}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 pb-4 px-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`complete-${task.id}`}
            checked={task.status === 'completed'}
            onCheckedChange={() => onToggleComplete(task.id)}
            aria-label={task.status === 'completed' ? "Mark task as incomplete" : "Mark task as complete"}
            className="transition-transform hover:scale-110"
          />
          <label
            htmlFor={`complete-${task.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            {task.status === 'completed' ? 'Completed' : 'Mark complete'}
          </label>
        </div>
        {task.status === 'completed' ? <CheckCircle className="h-5 w-5 text-success animate-pulse" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
      </CardFooter>
    </Card>
  );
}
