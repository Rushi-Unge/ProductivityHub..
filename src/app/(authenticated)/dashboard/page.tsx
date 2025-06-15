
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowUpRight, Briefcase, CheckCircle, DollarSign, ListChecks, Users } from "lucide-react";

const stats = [
  { title: "Tasks Completed", value: "120", change: "+15%", icon: <CheckCircle className="h-6 w-6 text-success" />, dataAiHint: "checkmark task" },
  { title: "Active Projects", value: "12", change: "+5", icon: <Briefcase className="h-6 w-6 text-primary" />, dataAiHint: "briefcase project" },
  { title: "Revenue", value: "$15,670", change: "+8%", icon: <DollarSign className="h-6 w-6 text-accent" />, dataAiHint: "money revenue" },
  { title: "Team Members", value: "8", change: "", icon: <Users className="h-6 w-6 text-secondary" />, dataAiHint: "people team" },
];

const recentTasks = [
  { id: 1, title: "Design landing page mockups", priority: "High", dueDate: "2024-08-15", completed: false },
  { id: 2, title: "Develop API authentication", priority: "Medium", dueDate: "2024-08-20", completed: true },
  { id: 3, title: "Write user documentation", priority: "Low", dueDate: "2024-09-01", completed: false },
];

const projectDeadlines = [
  { name: "Alpha Release", progress: 75, date: "2024-09-15" },
  { name: "Beta Testing Phase", progress: 40, date: "2024-10-30" },
  { name: "Product Launch", progress: 10, date: "2024-12-01" },
];


export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome to ProHub!</h1>
          <p className="text-muted-foreground">Here's an overview of your productivity.</p>
        </div>
        <Button>
          <ListChecks className="mr-2 h-4 w-4" /> Go to Tasks
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.change && <p className="text-xs text-muted-foreground flex items-center">
                <ArrowUpRight className="h-4 w-4 text-success mr-1"/> {stat.change} from last month
              </p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Quick look at your ongoing and recently completed tasks.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentTasks.map(task => (
                <li key={task.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                  <div>
                    <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Priority: {task.priority} | Due: {task.dueDate}
                    </p>
                  </div>
                  <Button variant={task.completed ? "outline" : "secondary"} size="sm">
                    {task.completed ? "View" : "Mark Done"}
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Project Deadlines</CardTitle>
            <CardDescription>Track progress towards your major project milestones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {projectDeadlines.map(project => (
              <div key={project.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{project.name}</span>
                  <span className="text-xs text-muted-foreground">{project.date}</span>
                </div>
                <Progress value={project.progress} aria-label={`${project.name} progress`} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      
      {/* Placeholder for Kanban or Grid view */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Task Overview</CardTitle>
          <CardDescription>Kanban or Grid view of tasks (Placeholder)</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center bg-muted/30 rounded-md">
          <p className="text-muted-foreground">Task board coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
