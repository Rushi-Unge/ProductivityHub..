
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit3, Trash2, CheckCircle, Circle } from "lucide-react";
import type { Task } from "@/app/(authenticated)/tasks/page"; // Assuming Task type is exported from tasks page

interface TaskCardProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: "bg-green-500 hover:bg-green-600",
  medium: "bg-yellow-500 hover:bg-yellow-600",
  high: "bg-red-500 hover:bg-red-600",
};

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const getPriorityBadgeVariant = (priority: 'low' | 'medium' | 'high' | string | undefined) => {
    switch (priority) {
      case 'low': return 'outline'; // default green-ish
      case 'medium': return 'secondary'; // default yellow-ish/gray-ish
      case 'high': return 'destructive'; // default red-ish
      default: return 'default';
    }
  };
  
  return (
    <Card className={`shadow-sm hover:shadow-lg transition-shadow duration-300 ease-in-out ${task.status === 'completed' ? 'opacity-70 bg-muted/50' : 'bg-card'}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className={`text-lg font-semibold ${task.status === 'completed' ? 'line-through' : ''}`}>
            {task.title}
          </CardTitle>
          {task.description && (
            <CardDescription className="text-sm leading-relaxed line-clamp-2">
              {task.description}
            </CardDescription>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="pb-4 space-y-3">
        {task.dueDate && (
          <p className="text-xs text-muted-foreground">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </p>
        )}
        {task.priority && (
          <Badge variant={getPriorityBadgeVariant(task.priority)} className="capitalize text-xs">
            {task.priority}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`complete-${task.id}`}
            checked={task.status === 'completed'}
            onCheckedChange={() => onToggleComplete(task.id)}
            aria-label={task.status === 'completed' ? "Mark task as incomplete" : "Mark task as complete"}
          />
          <label
            htmlFor={`complete-${task.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {task.status === 'completed' ? 'Completed' : 'Mark as complete'}
          </label>
        </div>
        {task.status === 'completed' ? <CheckCircle className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
      </CardFooter>
    </Card>
  );
}
