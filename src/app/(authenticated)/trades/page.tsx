
"use client"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Download, LineChart as SummaryLineChartIcon, Percent, ArrowUp, ArrowDown, Edit3, Trash2, MoreHorizontal, Image as ImageIcon, TrendingUp, CalendarDays, Target, Brain } from "lucide-react";
import AddTradeDialog from "@/components/add-trade-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO, differenceInDays, isWithinInterval, startOfWeek, endOfWeek, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export interface Trade {
  id: string;
  asset: string;
  entryTimestamp: string; // ISO string date
  exitTimestamp?: string; // ISO string date
  position: "long" | "short";
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  strategy?: string;
  reflection?: string;
  pnl?: number; // Calculated
  status: "open" | "closed"; // Operational status
  riskPercentage?: number;
  chartPlaceholderUrl: string;
  screenshotFilename?: string;
}

interface SummaryStat {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  colorClass?: string;
}

interface StrategyNote {
  id: string;
  title: string;
  content: string;
  lastUpdated: string;
  relatedTrades?: string[];
}

const mockStrategyNotes: StrategyNote[] = [
  { id: "sn1", title: "Breakout Confirmation Levels", content: "Always wait for a candle close above resistance for long breakouts. Volume should be at least 1.5x average.", lastUpdated: formatDistanceToNow(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), { addSuffix: true }) },
  { id: "sn2", title: "Risk Management for Volatile Assets", content: "For assets with ATR > 5%, consider reducing position size by 25-50%. Widen stop-loss slightly if necessary, but maintain R:R.", lastUpdated: formatDistanceToNow(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), { addSuffix: true }) },
  { id: "sn3", title: "Earnings Play Checklist", content: "1. Check implied volatility. 2. Define max loss before entry. 3. Have a plan for pre-market and post-market moves. 4. Avoid holding through binary events unless strategy dictates.", lastUpdated: formatDistanceToNow(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), { addSuffix: true }) },
];


function TradeDetailCard({ trade, onEdit, onDelete }: { trade: Trade; onEdit: (trade: Trade) => void; onDelete: (id: string) => void; }) {
  const getOutcomeDetails = (pnl: number | undefined, status: "open" | "closed") => {
    if (status === "open") return { text: "OPEN", badgeClass: "bg-info/20 text-info dark:text-info", pnlClass: "text-muted-foreground", borderClass: "border-info" };
    if (pnl === undefined || pnl === null) return { text: "N/A", badgeClass: "bg-muted text-muted-foreground", pnlClass: "text-muted-foreground", borderClass: "border-border" };
    if (pnl > 0) return { text: "PROFIT", badgeClass: "bg-success/20 text-success dark:text-success", pnlClass: "text-success", borderClass: "border-success" };
    if (pnl < 0) return { text: "LOSS", badgeClass: "bg-destructive/20 text-destructive dark:text-destructive", pnlClass: "text-destructive", borderClass: "border-destructive" };
    return { text: "BREAKEVEN", badgeClass: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400", pnlClass: "text-yellow-600 dark:text-yellow-400", borderClass: "border-yellow-500" };
  };

  const outcomeDetails = getOutcomeDetails(trade.pnl, trade.status);
  const formattedEntryDate = trade.entryTimestamp ? format(parseISO(trade.entryTimestamp), "MMM d") : "N/A";
  const formattedExitDate = trade.exitTimestamp ? format(parseISO(trade.exitTimestamp), "MMM d") : "N/A";

  const formattedPnl = trade.status === 'closed'
    ? `${(trade.pnl ?? 0) >= 0 ? "+" : ""}${trade.pnl?.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : "Active";

  return (
    <Card className={cn("shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col border-l-4 rounded-lg", outcomeDetails.borderClass, "bg-card")}>
      <CardHeader className="pt-4 pb-2 px-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold text-card-foreground">{trade.asset}</CardTitle>
            <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap", outcomeDetails.badgeClass)}>
              {outcomeDetails.text}
            </span>
          </div>
          <p className={cn("text-lg font-semibold", outcomeDetails.pnlClass)}>
            {formattedPnl}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm mt-1">
            <div>
                <p className="text-xs text-muted-foreground">Entry</p>
                <p className="font-medium text-card-foreground">${trade.entryPrice.toFixed(2)} &bull; {formattedEntryDate}</p>
            </div>
            <div className="text-right">
                <p className="text-xs text-muted-foreground">Exit</p>
                <p className="font-medium text-card-foreground">
                    {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : 'N/A'}
                    {trade.exitTimestamp ? ` &bull; ${formattedExitDate}` : ''}
                </p>
            </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-3 flex-grow space-y-3">
        <div className="aspect-[16/9] bg-muted rounded-md overflow-hidden my-2 flex items-center justify-center">
          <Image
            src={trade.chartPlaceholderUrl}
            alt={`${trade.asset} trade chart placeholder`}
            width={600}
            height={338}
            className="w-full h-full object-cover"
            data-ai-hint="trade chart stock"
          />
        </div>

        {trade.reflection && (
            <div>
                <h4 className="text-xs font-semibold text-muted-foreground mb-0.5">Reflection:</h4>
                <p className="text-sm text-muted-foreground line-clamp-3">{trade.reflection}</p>
            </div>
        )}
         {trade.screenshotFilename && (
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-2 border-t border-dashed">
            <ImageIcon className="h-4 w-4" />
            <span>Screenshot: {trade.screenshotFilename}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-xs pt-2 border-t">
            <p><span className="font-semibold text-muted-foreground">Strategy:</span> {trade.strategy || "N/A"}</p>
            <p><span className="font-semibold text-muted-foreground">Risk:</span> {trade.riskPercentage ? `${trade.riskPercentage}%` : "N/A"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryStatCard({ stat }: { stat: SummaryStat }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out rounded-lg bg-card">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
        {stat.icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", stat.colorClass)}>{stat.value}</div>
        {stat.change && <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>}
      </CardContent>
    </Card>
  );
}


const calculatePnl = (trade: Omit<Trade, 'id' | 'pnl' | 'status' | 'chartPlaceholderUrl' | 'screenshotFilename'> & { status: 'closed', exitPrice: number, exitTimestamp: string }): number => {
  if (trade.position === "long") {
    return (trade.exitPrice - trade.entryPrice) * trade.quantity;
  } else {
    return (trade.entryPrice - trade.exitPrice) * trade.quantity;
  }
};

const initialTrades: Trade[] = [
  { id: "t1", asset: "AAPL", entryTimestamp: new Date(2024, 6, 5, 9, 30).toISOString(), exitTimestamp: new Date(2024, 6, 7, 15, 0).toISOString(), position: "long", entryPrice: 175.20, exitPrice: 182.45, quantity: 10, strategy: "Breakout", reflection: "Perfect breakout trade. Entered after confirmation above resistance. Took profits at 4% gain as planned.", riskPercentage: 2, status: "closed", chartPlaceholderUrl: "https://placehold.co/600x338.png", screenshotFilename: "aapl_trade_setup.png" },
  { id: "t2", asset: "TSLA", entryTimestamp: new Date(2024, 6, 3, 10, 0).toISOString(), exitTimestamp: new Date(2024, 6, 4, 12, 0).toISOString(), position: "short", entryPrice: 245.80, exitPrice: 238.30, quantity: 5, strategy: "Earnings Play", reflection: "Stop loss triggered correctly. Market sentiment changed after earnings miss. Stuck to risk management rules.", riskPercentage: 1.5, status: "closed", chartPlaceholderUrl: "https://placehold.co/600x338.png"},
  { id: "t3", asset: "MSFT", entryTimestamp: new Date(2024, 6, 1, 14, 0).toISOString(), exitTimestamp: new Date(2024, 6, 6, 10,0).toISOString(), position: "long", entryPrice: 338.50, exitPrice: 345.20, quantity: 8, strategy: "Momentum", reflection: "Strong momentum trade. Good volume confirmation on breakout. Held for 5 days as trend continued.", riskPercentage: 2, status: "closed", chartPlaceholderUrl: "https://placehold.co/600x338.png", screenshotFilename: "msft_breakout.jpg" },
  { id: "t4", asset: "NVDA", entryTimestamp: new Date(2024, 5, 28, 11,0).toISOString(), exitTimestamp: new Date(2024, 5, 29, 15,0).toISOString(), position: "long", entryPrice: 485.30, exitPrice: 486.20, quantity: 3, strategy: "Scalp", reflection: "Choppy market.", riskPercentage: 1, status: "closed", chartPlaceholderUrl: "https://placehold.co/600x338.png" },
  { id: "t5", asset: "GOOGL", entryTimestamp: new Date(2024, 6, 28, 9,45).toISOString(), position: "long", entryPrice: 140.50, quantity: 10, strategy: "Value Dip Buy", reflection: "Monitoring for bounce.", riskPercentage: 2.5, status: "open", chartPlaceholderUrl: "https://placehold.co/600x338.png" },
  { id: "t6", asset: "ETH/USD", entryTimestamp: new Date(2024, 6, 29, 11, 0).toISOString(), exitTimestamp: new Date(2024, 6, 29, 18,30).toISOString(), position: "long", entryPrice: 2100.00, exitPrice: 2150.50, quantity: 2, strategy: "Range Break", reflection: "Quick scalp, target hit.", riskPercentage: 1, status: "closed", chartPlaceholderUrl: "https://placehold.co/600x338.png"},
];


initialTrades.forEach(trade => {
  if (trade.status === 'closed' && trade.exitPrice && trade.exitTimestamp) {
    trade.pnl = calculatePnl(trade as Omit<Trade, 'id' | 'pnl' | 'status' | 'chartPlaceholderUrl' | 'screenshotFilename'> & { status: 'closed', exitPrice: number, exitTimestamp: string });
  }
});


export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  const [weeklyInsights, setWeeklyInsights] = useState({
    totalPnl: 0,
    winRate: 0,
    winningTrades: 0,
    losingTrades: 0,
    bestAsset: 'N/A',
    mostUsedStrategy: 'N/A',
    weeklyTradesCount: 0,
    pnlByDay: [] as {name: string, pnl: number}[],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      const today = new Date();
      const firstDayOfWeek = startOfWeek(today, { weekStartsOn: 1 });
      const lastDayOfWeek = endOfWeek(today, { weekStartsOn: 1 });

      const recentClosedTrades = trades.filter(trade =>
        trade.status === 'closed' &&
        trade.exitTimestamp &&
        isWithinInterval(parseISO(trade.exitTimestamp), { start: firstDayOfWeek, end: lastDayOfWeek })
      );

      const dailyPnlMap = new Map<string, number>();
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      days.forEach(day => dailyPnlMap.set(day, 0));

      recentClosedTrades.forEach(trade => {
          const exitDate = parseISO(trade.exitTimestamp!);
          const dayName = format(exitDate, "EEE");
          dailyPnlMap.set(dayName, (dailyPnlMap.get(dayName) || 0) + (trade.pnl || 0));
      });

      const pnlByDayData = days.map(day => ({ name: day, pnl: dailyPnlMap.get(day) || 0 }));


      if (recentClosedTrades.length > 0) {
        const insightsPnl = recentClosedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
        const insightsWinning = recentClosedTrades.filter(t => (t.pnl || 0) > 0).length;
        const insightsLosing = recentClosedTrades.filter(t => (t.pnl || 0) < 0).length;
        const insightsWinRate = (insightsWinning / recentClosedTrades.length) * 100;

        const assetPnlMap = new Map<string, number>();
        recentClosedTrades.forEach(trade => {
          assetPnlMap.set(trade.asset, (assetPnlMap.get(trade.asset) || 0) + (trade.pnl || 0));
        });
        let bestPerformingAsset = 'N/A';
        let maxPnl = -Infinity;
        assetPnlMap.forEach((pnl, asset) => { if (pnl > maxPnl) { maxPnl = pnl; bestPerformingAsset = asset; } });

        const strategyCounts = new Map<string, number>();
        recentClosedTrades.forEach(trade => { if (trade.strategy) { strategyCounts.set(trade.strategy, (strategyCounts.get(trade.strategy) || 0) + 1); }});
        let mostFrequentStrategy = 'N/A';
        let maxCount = 0;
        strategyCounts.forEach((count, strategy) => { if (count > maxCount) { maxCount = count; mostFrequentStrategy = strategy; }});

        setWeeklyInsights({
          totalPnl: insightsPnl,
          winRate: insightsWinRate,
          winningTrades: insightsWinning,
          losingTrades: insightsLosing,
          bestAsset: bestPerformingAsset,
          mostUsedStrategy: mostFrequentStrategy,
          weeklyTradesCount: recentClosedTrades.length,
          pnlByDay: pnlByDayData,
        });
      } else {
        setWeeklyInsights({ totalPnl: 0, winRate: 0, winningTrades: 0, losingTrades: 0, bestAsset: 'N/A', mostUsedStrategy: 'N/A', weeklyTradesCount: 0, pnlByDay: pnlByDayData });
      }
    }
  }, [trades, isClient]);


  const handleAddOrUpdateTrade = (tradeData: Omit<Trade, 'id' | 'pnl' | 'status' | 'chartPlaceholderUrl'> & { status?: 'open' | 'closed', exitPrice?: number, exitTimestamp?: string, riskPercentage?: number, reflection?: string, screenshotFilename?: string }, id?: string) => {
    let newPnl: number | undefined = undefined;
    let finalStatus: 'open' | 'closed' = tradeData.status || (tradeData.exitPrice && tradeData.exitTimestamp ? 'closed' : 'open');

    let chartUrl = "https://placehold.co/600x338.png";


    if (finalStatus === 'closed' && tradeData.exitPrice && tradeData.exitTimestamp) {
        newPnl = calculatePnl({
            asset: tradeData.asset,
            entryTimestamp: tradeData.entryTimestamp,
            exitTimestamp: tradeData.exitTimestamp,
            position: tradeData.position,
            entryPrice: tradeData.entryPrice,
            exitPrice: tradeData.exitPrice,
            quantity: tradeData.quantity,
            strategy: tradeData.strategy,
            reflection: tradeData.reflection,
            status: 'closed'
        });
    }


    if (id) {
      setTrades(trades.map(t => t.id === id ? { ...t, ...tradeData, status: finalStatus, pnl: newPnl, exitPrice: tradeData.exitPrice, exitTimestamp: tradeData.exitTimestamp, chartPlaceholderUrl: t.chartPlaceholderUrl || chartUrl, reflection: tradeData.reflection, riskPercentage: tradeData.riskPercentage, screenshotFilename: tradeData.screenshotFilename } : t));
      toast({ title: "Trade Updated", description: `Trade for ${tradeData.asset} has been updated.` });
    } else {
      const newTrade: Trade = {
        ...tradeData,
        id: Date.now().toString(),
        status: finalStatus,
        pnl: newPnl,
        exitPrice: tradeData.exitPrice,
        exitTimestamp: tradeData.exitTimestamp,
        chartPlaceholderUrl: chartUrl,
        reflection: tradeData.reflection,
        riskPercentage: tradeData.riskPercentage,
        screenshotFilename: tradeData.screenshotFilename,
      };
      setTrades([newTrade, ...trades].sort((a,b) => parseISO(b.entryTimestamp).getTime() - parseISO(a.entryTimestamp).getTime()));
      toast({ title: "Trade Added", description: `New trade for ${newTrade.asset} has been logged.` });
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setTradeToEdit(trade);
    setIsDialogOpen(true);
  };

  const handleDeleteTrade = (id: string) => {
    const tradeToDelete = trades.find(t => t.id === id);
    setTrades(trades.filter(t => t.id !== id));
    toast({ title: "Trade Deleted", description: `Trade for ${tradeToDelete?.asset} has been deleted.`, variant: "destructive" });
  };

  const openNewTradeDialog = () => {
    setTradeToEdit(null);
    setIsDialogOpen(true);
  };

  const summaryStatsData = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    const totalPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0).length;
    const losingTradesCount = closedTrades.filter(t => (t.pnl || 0) < 0).length;
    const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

    const grossProfit = closedTrades.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = closedTrades.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0);

    const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
    const averageLoss = losingTradesCount > 0 ? grossLoss / losingTradesCount : 0;

    const pnlChangeText = totalPnl >= 0 ? `+${(Math.random()*15).toFixed(1)}% this month` : `-${(Math.random()*10).toFixed(1)}% this month`;


    return [
      { title: "Total P&L", value: totalPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' , minimumFractionDigits: 0, maximumFractionDigits: 0}), change: pnlChangeText, icon: <SummaryLineChartIcon className="h-5 w-5 text-muted-foreground" />, colorClass: totalPnl >= 0 ? 'text-success' : 'text-destructive' },
      { title: "Win Rate", value: `${winRate.toFixed(0)}%`, change: `${winningTrades} of ${closedTrades.length} trades`, icon: <Percent className="h-5 w-5 text-muted-foreground" /> },
      { title: "Avg. Win", value: averageWin.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }), change: "Per winning trade", icon: <ArrowUp className="h-5 w-5 text-success" /> },
      { title: "Avg. Loss", value: Math.abs(averageLoss).toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }), change: "Per losing trade", icon: <ArrowDown className="h-5 w-5 text-destructive" /> },
    ];
  }, [trades]);


  if (!isClient) {
    return (
       <div className="space-y-6 p-4 md:p-6 animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-12 w-64 rounded-xl" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
            {[1,2].map(i => <Skeleton key={i} className="h-[420px] w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">Trading Journal</h1>
          <p className="text-muted-foreground">Track your trades and analyze performance.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={openNewTradeDialog} size="default" className="shadow-md hover:shadow-lg transition-shadow rounded-lg hover-scale">
            <PlusCircle className="mr-2 h-5 w-5" /> New Trade
            </Button>
            <Button variant="outline" size="icon" className="shadow-sm hover:shadow-md transition-shadow rounded-lg hover-scale" aria-label="Export Trades">
                <Download className="h-5 w-5"/>
            </Button>
        </div>
      </div>

      <Tabs defaultValue="trade-journal" className="w-full">
        <TabsList className="mb-6 bg-muted/50 dark:bg-muted/20 rounded-xl p-1">
          <TabsTrigger value="trade-journal" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">Trade Journal</TabsTrigger>
          <TabsTrigger value="weekly-insights" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">Weekly Insights</TabsTrigger>
          <TabsTrigger value="strategy-notes" className="data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg">Strategy Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="trade-journal" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryStatsData.map((stat, idx) => <div key={stat.title} className="animate-slide-up-fade" style={{animationDelay: `${idx * 75}ms`}}><SummaryStatCard stat={stat} /></div>)}
            </div>

            {trades.length === 0 ? (
                <div className="text-center py-16 col-span-full animate-fade-in">
                <SummaryLineChartIcon className="mx-auto h-20 w-20 text-muted-foreground opacity-30" />
                <p className="mt-6 text-xl font-medium text-muted-foreground">No trades logged yet.</p>
                <p className="text-sm text-muted-foreground">Click "+ New Trade" to get started.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {trades.sort((a,b) => parseISO(b.entryTimestamp).getTime() - parseISO(a.entryTimestamp).getTime()).map((trade, index) => (
                         <div key={trade.id} className="animate-slide-up-fade" style={{animationDelay: `${index * 50}ms`}}>
                            <TradeDetailCard trade={trade} onEdit={handleEditTrade} onDelete={handleDeleteTrade} />
                        </div>
                    ))}
                </div>
            )}
        </TabsContent>
        <TabsContent value="weekly-insights" className="space-y-6 animate-fade-in">
            <Card className="shadow-xl rounded-2xl border bg-card">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-foreground font-headline flex items-center"><CalendarDays className="mr-3 h-6 w-6 text-primary"/>This Week's Performance</CardTitle>
                    <CardDescription>Summary of your trading activity in the current week.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <InfoCard title="Weekly P&L" value={weeklyInsights.totalPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' , minimumFractionDigits: 0, maximumFractionDigits: 0})} icon={<TrendingUp className={cn("h-6 w-6", weeklyInsights.totalPnl >= 0 ? "text-success" : "text-destructive")}/>} />
                    <InfoCard title="Weekly Win Rate" value={`${weeklyInsights.winRate.toFixed(0)}%`} icon={<Percent className="h-6 w-6 text-muted-foreground"/>} />
                    <InfoCard title="Trades This Week" value={String(weeklyInsights.weeklyTradesCount)} icon={<Target className="h-6 w-6 text-muted-foreground"/>} />
                    <InfoCard title="Winning Trades" value={String(weeklyInsights.winningTrades)} icon={<ArrowUp className="h-6 w-6 text-success"/>} />
                    <InfoCard title="Losing Trades" value={String(weeklyInsights.losingTrades)} icon={<ArrowDown className="h-6 w-6 text-destructive"/>} />
                    <InfoCard title="Most Profitable Asset" value={weeklyInsights.bestAsset} icon={<SummaryLineChartIcon className="h-6 w-6 text-muted-foreground"/>} />
                    <InfoCard title="Most Used Strategy" value={weeklyInsights.mostUsedStrategy} icon={<Brain className="h-6 w-6 text-muted-foreground"/>} />
                </CardContent>
            </Card>
            <Card className="shadow-xl rounded-2xl border bg-card">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-foreground font-headline">Daily P&L Breakdown (This Week)</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyInsights.pnlByDay} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={(value) => `$${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                                labelStyle={{ color: 'hsl(var(--popover-foreground))', fontWeight: 'bold' }}
                                itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                cursor={{fill: 'hsla(var(--muted), 0.5)'}}
                            />
                            <Legend wrapperStyle={{fontSize: "12px"}}/>
                            <Bar dataKey="pnl" name="P&L" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="strategy-notes" className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-foreground font-headline">Strategy Journal</h2>
                <Button variant="outline" className="rounded-xl hover-scale">
                    <PlusCircle className="mr-2 h-4 w-4"/> Add Strategy Note
                </Button>
            </div>
             {mockStrategyNotes.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <Brain className="mx-auto h-20 w-20 opacity-30" />
                    <p className="mt-6 text-xl font-medium">No strategy notes yet.</p>
                    <p className="text-sm">Start documenting your trading strategies and observations.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {mockStrategyNotes.map((note, idx) => (
                    <Card key={note.id} className="shadow-lg hover:shadow-xl rounded-xl border hover-scale animate-slide-up-fade bg-card" style={{animationDelay: `${idx * 100}ms`}}>
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-card-foreground">{note.title}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Last updated: {note.lastUpdated}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-4">{note.content}</p>
                    </CardContent>
                    <CardFooter>
                        <Button variant="link" size="sm" className="text-primary hover:text-accent p-0 h-auto">Read More</Button>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            )}
        </TabsContent>
      </Tabs>

      <AddTradeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleAddOrUpdateTrade}
        tradeToEdit={tradeToEdit}
      />

       <div className="mt-8 text-center text-sm text-muted-foreground">
          <p><strong>Note:</strong> Chart images are placeholders. Screenshot uploads are simulated (filename only). Backend integration is required for full functionality.</p>
        </div>
    </div>
  );
}


interface InfoCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
}
function InfoCard({title, value, icon, description}: InfoCardProps) {
    return (
        <Card className="bg-muted/30 dark:bg-muted/20 border-dashed border-border hover:shadow-md transition-shadow rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {description && <p className="text-xs text-muted-foreground pt-1">{description}</p>}
            </CardContent>
        </Card>
    )
}

