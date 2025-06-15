
"use client"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Download, LineChart as SummaryLineChartIcon, Percent, ArrowUp, ArrowDown, Edit3, Trash2, MoreHorizontal } from "lucide-react";
import AddTradeDialog from "@/components/add-trade-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Represents an individual trade
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
  reflection?: string; // Was notes
  pnl?: number; // Calculated
  status: "open" | "closed"; // Operational status
  riskPercentage?: number;
  chartPlaceholderUrl: string;
}

// For the summary cards at the top
interface SummaryStat {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  colorClass?: string; // For text color of value
}

// Component for individual trade cards in the grid
function TradeDetailCard({ trade, onEdit, onDelete }: { trade: Trade; onEdit: (trade: Trade) => void; onDelete: (id: string) => void; }) {
  const getOutcome = (pnl: number | undefined) => {
    if (pnl === undefined || pnl === null) return { text: "OPEN", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" };
    if (pnl > 0) return { text: "PROFIT", color: "bg-success/20 text-success-foreground dark:text-green-400" };
    if (pnl < 0) return { text: "LOSS", color: "bg-destructive/20 text-destructive-foreground dark:text-red-400" };
    return { text: "BREAKEVEN", color: "bg-muted text-muted-foreground" };
  };

  const tradeOutcome = getOutcome(trade.pnl);
  const formattedEntryDate = trade.entryTimestamp ? format(parseISO(trade.entryTimestamp), "MMM d") : "N/A";
  const formattedExitDate = trade.exitTimestamp ? format(parseISO(trade.exitTimestamp), "MMM d") : "N/A";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      <CardHeader className="pt-4 pb-2 px-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">{trade.asset}</CardTitle>
            <span className={cn("px-2 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap", tradeOutcome.color)}>
              {tradeOutcome.text}
            </span>
          </div>
          <p className={cn("text-lg font-semibold", (trade.pnl ?? 0) >= 0 ? "text-success" : "text-destructive")}>
            {(trade.pnl ?? 0) >= 0 ? "+" : ""}{trade.pnl?.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? "N/A"}
          </p>
        </div>
        <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
          <p>Entry: ${trade.entryPrice.toFixed(2)} • {formattedEntryDate}</p>
          <p>Exit: {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : 'N/A'} • {trade.exitTimestamp ? formattedExitDate : 'N/A'}</p>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 flex-grow space-y-3">
        <div className="aspect-[2/1] bg-muted rounded-md overflow-hidden my-2">
          <Image 
            src={trade.chartPlaceholderUrl} 
            alt={`${trade.asset} trade chart placeholder`} 
            width={300} 
            height={150} 
            className="w-full h-full object-cover"
            data-ai-hint="trade chart stock" 
          />
        </div>
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-0.5">Reflection:</h4>
          <p className="text-sm line-clamp-2">{trade.reflection || "No reflection provided."}</p>
        </div>
        <div className="flex justify-between items-center text-xs">
            <p><span className="font-semibold text-muted-foreground">Strategy:</span> {trade.strategy || "N/A"}</p>
            <p><span className="font-semibold text-muted-foreground">Risk:</span> {trade.riskPercentage ? `${trade.riskPercentage}%` : "N/A"}</p>
        </div>
      </CardContent>
       <CardFooter className="px-4 pb-4 pt-2 border-t">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto text-muted-foreground hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" /> Manage Trade
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(trade)} className="cursor-pointer">
                <Edit3 className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(trade.id)} className="text-destructive focus:text-destructive cursor-pointer">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </CardFooter>
    </Card>
  );
}

// Component for summary stat cards
function SummaryStatCard({ stat }: { stat: SummaryStat }) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
        {stat.icon}
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", stat.colorClass)}>{stat.value}</div>
        {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
      </CardContent>
    </Card>
  );
}


const calculatePnl = (trade: Omit<Trade, 'pnl' | 'id' | 'status' | 'chartPlaceholderUrl'> & { status: 'closed', exitPrice: number, exitTimestamp: string }): number => {
  if (trade.position === "long") {
    return (trade.exitPrice - trade.entryPrice) * trade.quantity;
  } else {
    return (trade.entryPrice - trade.exitPrice) * trade.quantity;
  }
};

const initialTrades: Trade[] = [
  { id: "t1", asset: "AAPL", entryTimestamp: new Date(2024, 6, 5, 9, 30).toISOString(), exitTimestamp: new Date(2024, 6, 7, 15, 0).toISOString(), position: "long", entryPrice: 175.20, exitPrice: 182.45, quantity: 10, strategy: "Breakout", reflection: "Perfect breakout trade. Entered after confirmation above resistance. Took profits at 4% gain as planned.", riskPercentage: 2, status: "closed", chartPlaceholderUrl: "https://placehold.co/300x150/22C55E/FFFFFF.png" },
  { id: "t2", asset: "TSLA", entryTimestamp: new Date(2024, 6, 3, 10, 0).toISOString(), exitTimestamp: new Date(2024, 6, 4, 12, 0).toISOString(), position: "short", entryPrice: 245.80, exitPrice: 238.30, quantity: 5, strategy: "Earnings Play", reflection: "Stop loss triggered correctly. Market sentiment changed after earnings miss. Stuck to risk management rules.", riskPercentage: 1.5, status: "closed", chartPlaceholderUrl: "https://placehold.co/300x150/EF4444/FFFFFF.png"},
  { id: "t3", asset: "MSFT", entryTimestamp: new Date(2024, 6, 1, 14, 0).toISOString(), exitTimestamp: new Date(2024, 6, 6, 10,0).toISOString(), position: "long", entryPrice: 338.50, exitPrice: 345.20, quantity: 8, strategy: "Momentum", reflection: "Strong momentum trade. Good volume confirmation on breakout. Held for 5 days as trend continued.", riskPercentage: 2, status: "closed", chartPlaceholderUrl: "https://placehold.co/300x150/22C55E/FFFFFF.png" },
  { id: "t4", asset: "NVDA", entryTimestamp: new Date(2024, 5, 28, 11,0).toISOString(), exitTimestamp: new Date(2024, 5, 29, 15,0).toISOString(), position: "long", entryPrice: 485.30, exitPrice: 486.20, quantity: 3, strategy: "Scalp", reflection: "Choppy market conditions. Exited early due to lack of momentum. Small profit after commissions.", riskPercentage: 1, status: "closed", chartPlaceholderUrl: "https://placehold.co/300x150/E5E7EB/1F2937.png" },
  { id: "t5", asset: "GOOGL", entryTimestamp: new Date(2024, 6, 8, 9,45).toISOString(), position: "long", entryPrice: 140.50, quantity: 10, strategy: "Value Dip Buy", reflection: "Monitoring for bounce from support.", riskPercentage: 2.5, status: "open", chartPlaceholderUrl: "https://placehold.co/300x150/38BDF8/FFFFFF.png" },
];

initialTrades.forEach(trade => {
  if (trade.status === 'closed' && trade.exitPrice && trade.exitTimestamp) {
    trade.pnl = calculatePnl(trade as Omit<Trade, 'pnl' | 'id' | 'status' | 'chartPlaceholderUrl'> & { status: 'closed', exitPrice: number, exitTimestamp: string });
  }
});


export default function TradingJournalPage() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tradeToEdit, setTradeToEdit] = useState<Trade | null>(null);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddOrUpdateTrade = (tradeData: Omit<Trade, 'id' | 'pnl' | 'status' | 'chartPlaceholderUrl'> & { status?: 'open' | 'closed', exitPrice?: number, exitTimestamp?: string, riskPercentage?: number, reflection?: string }, id?: string) => {
    let newPnl: number | undefined = undefined;
    let finalStatus: 'open' | 'closed' = tradeData.status || (tradeData.exitPrice && tradeData.exitTimestamp ? 'closed' : 'open');
    
    // Default chart placeholder, can be customized further if needed
    let chartUrl = "https://placehold.co/300x150/E5E7EB/1F2937.png";


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
        chartUrl = newPnl >= 0 ? "https://placehold.co/300x150/22C55E/FFFFFF.png" : "https://placehold.co/300x150/EF4444/FFFFFF.png";
    } else if (finalStatus === 'open') {
        chartUrl = "https://placehold.co/300x150/38BDF8/FFFFFF.png";
    }


    if (id) { 
      setTrades(trades.map(t => t.id === id ? { ...t, ...tradeData, status: finalStatus, pnl: newPnl, exitPrice: tradeData.exitPrice, exitTimestamp: tradeData.exitTimestamp, chartPlaceholderUrl: t.chartPlaceholderUrl || chartUrl, reflection: tradeData.reflection, riskPercentage: tradeData.riskPercentage } : t));
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
      };
      setTrades([newTrade, ...trades]);
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
    const grossLoss = closedTrades.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0); // Gross loss is sum of negative PnLs

    const averageWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
    const averageLoss = losingTradesCount > 0 ? grossLoss / losingTradesCount : 0; // Avg loss is avg of negative PnLs (so it's negative)

    return [
      { title: "Total P&L", value: totalPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' }), change: "+12.3% this month", icon: <SummaryLineChartIcon className="h-5 w-5 text-muted-foreground" />, colorClass: totalPnl >= 0 ? 'text-success' : 'text-destructive' },
      { title: "Win Rate", value: `${winRate.toFixed(0)}%`, change: `${winningTrades} of ${closedTrades.length} trades`, icon: <Percent className="h-5 w-5 text-muted-foreground" /> },
      { title: "Avg Win", value: averageWin.toLocaleString(undefined, { style: 'currency', currency: 'USD' }), change: "Per winning trade", icon: <ArrowUp className="h-5 w-5 text-success" /> },
      { title: "Avg Loss", value: averageLoss.toLocaleString(undefined, { style: 'currency', currency: 'USD' }), change: "Per losing trade", icon: <ArrowDown className="h-5 w-5 text-destructive" /> },
    ];
  }, [trades]);


  if (!isClient) {
    return (
       <div className="space-y-6 p-1 md:p-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Skeleton className="h-12 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-10 w-full max-w-md rounded-lg" /> {/* Tabs skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-[380px] w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1 md:p-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground">Track your trades and analyze performance.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button onClick={openNewTradeDialog} size="default" className="shadow-md hover:shadow-lg transition-shadow">
            <PlusCircle className="mr-2 h-5 w-5" /> New Trade
            </Button>
            <Button variant="outline" size="icon" className="shadow-sm hover:shadow-md transition-shadow" aria-label="Export Trades">
                <Download className="h-5 w-5"/>
            </Button>
        </div>
      </div>

      <Tabs defaultValue="trade-journal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="trade-journal">Trade Journal</TabsTrigger>
          <TabsTrigger value="weekly-insights" disabled>Weekly Insights</TabsTrigger>
          <TabsTrigger value="strategy-notes" disabled>Strategy Notes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trade-journal" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryStatsData.map(stat => <SummaryStatCard key={stat.title} stat={stat} />)}
            </div>
            
            {trades.length === 0 ? (
                <div className="text-center py-16 col-span-full">
                <SummaryLineChartIcon className="mx-auto h-20 w-20 text-muted-foreground opacity-30" />
                <p className="mt-6 text-xl font-medium text-muted-foreground">No trades logged yet.</p>
                <p className="text-sm text-muted-foreground">Click "+ New Trade" to get started.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                    {trades.map((trade) => (
                        <TradeDetailCard key={trade.id} trade={trade} onEdit={handleEditTrade} onDelete={handleDeleteTrade} />
                    ))}
                </div>
            )}
        </TabsContent>
        <TabsContent value="weekly-insights">
            <Card>
                <CardHeader><CardTitle>Weekly Insights</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Weekly insights and performance analysis will be shown here. (Coming Soon)</p></CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="strategy-notes">
            <Card>
                <CardHeader><CardTitle>Strategy Notes</CardTitle></CardHeader>
                <CardContent><p className="text-muted-foreground">Notes and observations about your trading strategies. (Coming Soon)</p></CardContent>
            </Card>
        </TabsContent>
      </Tabs>

      <AddTradeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleAddOrUpdateTrade} 
        tradeToEdit={tradeToEdit} 
      />

       <div className="mt-8 text-center text-sm text-muted-foreground">
          <p><strong>Note:</strong> Chart images are placeholders. Backend integration is required for dynamic chart generation and data persistence.</p>
        </div>
    </div>
  );
}


    