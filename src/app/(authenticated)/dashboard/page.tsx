
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowUpRight, Briefcase, CheckCircle, DollarSign, ListChecks, Users, Zap, Eye } from "lucide-react";
import Link from "next/link";

const stats = [
  { title: "Tasks Completed", value: "120", change: "+15%", icon: <CheckCircle className="h-6 w-6 text-success" />, dataAiHint: "checkmark task" },
  { title: "Active Projects", value: "12", change: "+5", icon: <Briefcase className="h-6 w-6 text-primary" />, dataAiHint: "briefcase project" },
  { title: "Revenue (Demo)", value: "$15,670", change: "+8%", icon: <DollarSign className="h-6 w-6 text-accent" />, dataAiHint: "money revenue" },
  { title: "Focus Sessions", value: "27", change: "+3 today", icon: <Zap className="h-6 w-6 text-secondary" />, dataAiHint: "lightning focus" },
];

const recentTasks = [
  { id: 1, title: "Design landing page mockups", priority: "High", dueDate: "2024-08-15", completed: false, href: "/tasks" },
  { id: 2, title: "Develop API authentication", priority: "Medium", dueDate: "2024-08-20", completed: true, href: "/tasks" },
  { id: 3, title: "Write user documentation", priority: "Low", dueDate: "2024-09-01", completed: false, href: "/tasks" },
];

const projectDeadlines = [
  { name: "Alpha Release", progress: 75, date: "2024-09-15" },
  { name: "Beta Testing Phase", progress: 40, date: "2024-10-30" },
  { name: "Product Launch", progress: 10, date: "2024-12-01" },
];


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-1 md:p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome to ProHub!</h1>
          <p className="text-muted-foreground">Here's your productivity pulse for today.</p>
        </div>
        <Link href="/tasks">
          <Button className="shadow-md hover:shadow-lg transition-shadow">
            <ListChecks className="mr-2 h-4 w-4" /> View All Tasks
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.02] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-success mr-1"/> {stat.change} 
              </p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Quick look at your ongoing and recently completed tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <ul className="space-y-3">
                {recentTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/20 rounded-md transition-colors hover:bg-muted">
                    <div>
                      <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Priority: {task.priority} | Due: {task.dueDate}
                      </p>
                    </div>
                    <Link href={task.href}>
                      <Button variant={task.completed ? "outline" : "secondary"} size="sm" className="transition-transform hover:scale-105">
                        {task.completed ? <Eye className="h-4 w-4"/> : "Go to Task"}
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent tasks to display.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
          <CardHeader>
            <CardTitle>Project Deadlines</CardTitle>
            <CardDescription>Track progress towards your major project milestones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectDeadlines.length > 0 ? projectDeadlines.map(project => (
              <div key={project.name} className="p-3 bg-muted/50 dark:bg-muted/20 rounded-md">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-foreground">{project.name}</span>
                  <span className="text-xs text-muted-foreground">{project.date}</span>
                </div>
                <Progress value={project.progress} aria-label={`${project.name} progress`} className="h-2"/>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">No project deadlines set.</p>}
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out">
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
          <CardDescription>A visual representation of your task distribution (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-muted/30 dark:bg-muted/20 rounded-md">
           <img src="https://placehold.co/400x200.png" alt="Task chart placeholder" data-ai-hint="task chart graph" className="opacity-50 rounded-md"/>
          {/* <p className="text-muted-foreground">Task board or chart coming soon...</p> */}
        </CardContent>
      </Card>
    </div>
  );
}
