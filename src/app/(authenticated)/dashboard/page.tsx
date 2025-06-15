
"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowUpRight, DollarSign, Eye, StickyNote, TrendingUp, TrendingDown, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format, parseISO, formatDistanceToNow } from "date-fns";
import type { Task } from "@/app/(authenticated)/tasks/page";
import type { Note } from "@/app/(authenticated)/notes/page";
import type { Trade } from "@/app/(authenticated)/trades/page";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";


const initialDashboardTasks: Task[] = [
  { id: "1", title: "Submit quarterly report", description: "Finalize and submit the Q3 financial report.", dueDate: "2024-08-10", priority: "high", status: "pending" },
  { id: "4", title: "Client onboarding call", description: "Onboard new client Acme Corp.", dueDate: "2024-08-01", priority: "high", status: "pending" },
  { id: "5", title: "Research new marketing tools", description: "Explore new tools for social media management.", dueDate: "2024-08-25", priority: "medium", status: "pending" },
  { id: "2", title: "Plan team retreat", description: "Organize logistics for upcoming event.", dueDate: "2024-09-15", priority: "medium", status: "pending" },
];

const initialDashboardNotes: Note[] = [
  { id: "n3", title: "Book Insights: 'Atomic Habits'", content: "Key takeaways:\n- Focus on systems, not goals.\n- Make it obvious, attractive, easy, satisfying.", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), tags: [], isStarred: false, isArchived: false, isTrashed: false},
  { id: "n1", title: "Project Ideas for ProHub", content: "1. AI-driven task suggestions.\n2. Team collaboration module.", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), tags: [], isStarred: false, isArchived: false, isTrashed: false },
  { id: "n2", title: "Weekly Goals (Current)", content: "- Finalize Q4 budget presentation.\n- Conduct user interviews.", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), tags: [], isStarred: false, isArchived: false, isTrashed: false },
];

const calculatePnl = (trade: Omit<Trade, 'id' | 'pnl' | 'status' | 'chartPlaceholderUrl' | 'screenshotFilename'> & { status: 'closed', exitPrice: number, exitTimestamp: string }): number => {
  if (trade.position === "long") {
    return (trade.exitPrice - trade.entryPrice) * trade.quantity;
  } else {
    return (trade.entryPrice - trade.exitPrice) * trade.quantity;
  }
};

const initialDashboardTrades: Trade[] = [
  { id: "t1", asset: "AAPL", entryTimestamp: new Date(2024, 6, 5, 9, 30).toISOString(), exitTimestamp: new Date(2024, 6, 7, 15, 0).toISOString(), position: "long", entryPrice: 175.20, exitPrice: 182.45, quantity: 10, strategy: "Breakout", reflection: "Perfect breakout.", riskPercentage: 2, status: "closed", chartPlaceholderUrl: "https://placehold.co/300x150.png", screenshotFilename: "aapl_trade_setup.png" },
  { id: "t2", asset: "TSLA", entryTimestamp: new Date(2024, 6, 3, 10, 0).toISOString(), exitTimestamp: new Date(2024, 6, 4, 12, 0).toISOString(), position: "short", entryPrice: 245.80, exitPrice: 238.30, quantity: 5, strategy: "Earnings Play", reflection: "Stop loss triggered.", riskPercentage: 1.5, status: "closed", chartPlaceholderUrl: "https://placehold.co/300x150.png"},
  { id: "t5", asset: "GOOGL", entryTimestamp: new Date(2024, 6, 8, 9,45).toISOString(), position: "long", entryPrice: 140.50, quantity: 10, strategy: "Value Dip Buy", riskPercentage: 2.5, status: "open", chartPlaceholderUrl: "https://placehold.co/300x150.png" },
];
initialDashboardTrades.forEach(trade => {
  if (trade.status === 'closed' && trade.exitPrice && trade.exitTimestamp) {
    trade.pnl = calculatePnl(trade as Omit<Trade, 'id' | 'pnl' | 'status' | 'chartPlaceholderUrl' | 'screenshotFilename'> & { status: 'closed', exitPrice: number, exitTimestamp: string });
  }
});


export default function DashboardPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [tradeStats, setTradeStats] = React.useState<Array<{title: string; value: string; icon: React.ReactNode; colorClass?: string }>>([]);

  React.useEffect(() => {
    setIsClient(true);
    
    const closedTrades = initialDashboardTrades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    const totalPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTradesCount = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    const losingTradesCount = closedTrades.filter(t => (t.pnl || 0) < 0).length;
    const winRate = closedTrades.length > 0 ? (winningTradesCount / closedTrades.length) * 100 : 0;

    const grossProfit = closedTrades.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = closedTrades.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0);
    const averageWin = winningTradesCount > 0 ? grossProfit / winningTradesCount : 0;
    const averageLoss = losingTradesCount > 0 ? grossLoss / losingTradesCount : 0; 

    setTradeStats([
      { title: "Total P&L", value: totalPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' }), icon: <DollarSign className="h-5 w-5 text-muted-foreground" />, colorClass: totalPnl >= 0 ? 'text-success' : 'text-destructive' },
      { title: "Win Rate", value: `${winRate.toFixed(0)}%`, icon: <Activity className="h-5 w-5 text-muted-foreground" /> },
      { title: "Avg. Win", value: averageWin.toLocaleString(undefined, { style: 'currency', currency: 'USD' }), icon: <TrendingUp className="h-5 w-5 text-success" /> },
      { title: "Avg. Loss", value: Math.abs(averageLoss).toLocaleString(undefined, { style: 'currency', currency: 'USD' }), icon: <TrendingDown className="h-5 w-5 text-destructive" /> },
    ]);

  }, []); 

  const displayedTasks = initialDashboardTasks
    .filter(t => t.status === 'pending')
    .sort((a,b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime() )
    .slice(0, 3);

  const displayedNotes = initialDashboardNotes
    .sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);


  if (!isClient) {
    return (
      <div className="space-y-8 p-4 md:p-8 animate-pulse">
        <div className="h-10 bg-muted rounded-xl w-3/4"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Card key={i} className="h-32 bg-muted rounded-2xl shadow-none border-none"><CardContent className="h-full"></CardContent></Card>)}
        </div>
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          <Card className="h-72 bg-muted rounded-2xl shadow-none border-none"><CardContent className="h-full"></CardContent></Card>
          <Card className="h-72 bg-muted rounded-2xl shadow-none border-none"><CardContent className="h-full"></CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Welcome to ProHub!</h1>
          <p className="text-muted-foreground">Here's your productivity pulse for today.</p>
        </div>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4 font-headline">Trading Snapshot</h2>
        {tradeStats.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
             {[...Array(4)].map((_, i) => (
                <Card key={i} className="shadow-lg rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-5 w-20 rounded-md bg-muted"/>
                        <Skeleton className="h-6 w-6 rounded-full bg-muted"/>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-24 rounded-md bg-muted"/>
                    </CardContent>
                </Card>
             ))}
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {tradeStats.map((stat) => (
                <Card key={stat.title} className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out hover:scale-[1.01] rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                    {stat.icon}
                    </CardHeader>
                    <CardContent>
                    <div className={cn("text-2xl font-bold", stat.colorClass)}>{stat.value}</div>
                    </CardContent>
                </Card>
                ))}
            </div>
        )}
      </section>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out rounded-2xl">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-headline">Upcoming Tasks</CardTitle>
                <Link href="/tasks" className="text-sm text-primary hover:underline flex items-center">
                    View All <ArrowUpRight className="h-4 w-4 ml-1"/>
                </Link>
            </div>
            <CardDescription className="text-sm">Your most pressing to-dos.</CardDescription>
          </CardHeader>
          <CardContent>
            {displayedTasks.length > 0 ? (
              <ul className="space-y-3">
                {displayedTasks.map(task => (
                  <li key={task.id} className="flex items-center justify-between p-3 bg-muted/30 dark:bg-muted/10 rounded-xl transition-colors hover:bg-muted/50 dark:hover:bg-muted/20">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm text-foreground">{task.title}</p>
                      <div className="text-xs text-muted-foreground flex items-center gap-x-2 mt-0.5">
                        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'info'} className={cn("capitalize text-[10px] px-1.5 py-0 h-5")}>{task.priority}</Badge>
                        {task.dueDate && <span className="whitespace-nowrap">Due: {format(parseISO(task.dueDate), "MMM d")}</span>}
                      </div>
                    </div>
                    <Link href="/tasks" className="ml-2 flex-shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary">
                        <Eye className="h-4 w-4"/> 
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ThumbsUp className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending tasks. Great job!</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out rounded-2xl">
          <CardHeader>
             <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-headline">Recent Notes</CardTitle>
                <Link href="/notes" className="text-sm text-primary hover:underline flex items-center">
                    View All <ArrowUpRight className="h-4 w-4 ml-1"/>
                </Link>
            </div>
            <CardDescription className="text-sm">Your latest thoughts and ideas.</CardDescription>
          </CardHeader>
          <CardContent>
            {displayedNotes.length > 0 ? (
              <ul className="space-y-3">
                {displayedNotes.map(note => (
                  <li key={note.id} className={cn("p-3 rounded-xl transition-colors hover:opacity-80 bg-muted/30 dark:bg-muted/10 hover:bg-muted/50 dark:hover:bg-muted/20")}>
                    <Link href="/notes" className="block group">
                      <h4 className={cn("font-medium truncate group-hover:underline text-sm text-card-foreground")}>{note.title}</h4>
                      <p className={cn("text-xs line-clamp-1 group-hover:underline text-card-foreground/80 mt-0.5")}>{note.content.split('\n')[0]}</p>
                      <p className={cn("text-xs mt-1 text-muted-foreground/70")}>{formatDistanceToNow(parseISO(note.updatedAt), { addSuffix: true })}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
                <div className="text-center py-8 text-muted-foreground">
                    <StickyNote className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No notes yet. Start jotting down ideas!</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
