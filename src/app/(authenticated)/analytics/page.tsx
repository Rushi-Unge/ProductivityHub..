
"use client"

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, Edit3, Trash2, TrendingUp, DollarSign, Percent, ListFilter, FileText } from "lucide-react";
import AddTradeDialog from "@/components/add-trade-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export interface Trade {
  id: string;
  asset: string;
  entryTimestamp: string;
  exitTimestamp?: string;
  position: "long" | "short";
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  strategy?: string;
  notes?: string;
  pnl?: number; // Calculated
  status: "open" | "closed";
}

const calculatePnl = (trade: Omit<Trade, 'pnl' | 'id' | 'status'> & { status: 'closed', exitPrice: number, exitTimestamp: string }): number => {
  if (trade.position === "long") {
    return (trade.exitPrice - trade.entryPrice) * trade.quantity;
  } else {
    return (trade.entryPrice - trade.exitPrice) * trade.quantity;
  }
};

const initialTrades: Trade[] = [
  { id: "t1", asset: "AAPL", entryTimestamp: new Date(2024, 6, 1, 9, 30).toISOString(), exitTimestamp: new Date(2024, 6, 1, 15, 0).toISOString(), position: "long", entryPrice: 150.25, exitPrice: 155.75, quantity: 10, strategy: "Earnings Breakout", notes: "Good volume, held through initial dip.", status: "closed" },
  { id: "t2", asset: "BTC/USD", entryTimestamp: new Date(2024, 6, 2, 10, 0).toISOString(), exitTimestamp: new Date(2024, 6, 3, 12, 0).toISOString(), position: "short", entryPrice: 30000, exitPrice: 29500, quantity: 0.1, strategy: "Resistance Rejection", notes: "Target hit.", status: "closed"},
  { id: "t3", asset: "MSFT", entryTimestamp: new Date(2024, 6, 4, 14, 0).toISOString(), position: "long", entryPrice: 250.00, quantity: 5, strategy: "Support Bounce", notes: "Watching for confirmation.", status: "open"},
];

// Calculate PnL for initial closed trades
initialTrades.forEach(trade => {
  if (trade.status === 'closed' && trade.exitPrice && trade.exitTimestamp) {
    trade.pnl = calculatePnl(trade as Omit<Trade, 'pnl' | 'id' | 'status'> & { status: 'closed', exitPrice: number, exitTimestamp: string });
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
    // In a real app, load trades from localStorage or an API
  }, []);

  const handleAddOrUpdateTrade = (tradeData: Omit<Trade, 'id' | 'pnl' | 'status'> & { status?: 'open' | 'closed', exitPrice?: number, exitTimestamp?: string }, id?: string) => {
    let newPnl: number | undefined = undefined;
    let finalStatus: 'open' | 'closed' = tradeData.status || 'open';

    if (tradeData.exitPrice && tradeData.exitTimestamp) {
        finalStatus = 'closed';
        newPnl = calculatePnl({
            asset: tradeData.asset,
            entryTimestamp: tradeData.entryTimestamp,
            exitTimestamp: tradeData.exitTimestamp,
            position: tradeData.position,
            entryPrice: tradeData.entryPrice,
            exitPrice: tradeData.exitPrice,
            quantity: tradeData.quantity,
            strategy: tradeData.strategy,
            notes: tradeData.notes,
            status: 'closed' // Assert status as closed for PNL calculation
        });
    }


    if (id) { // Editing trade
      setTrades(trades.map(t => t.id === id ? { ...t, ...tradeData, status: finalStatus, pnl: newPnl, exitPrice: tradeData.exitPrice, exitTimestamp: tradeData.exitTimestamp } : t));
      toast({ title: "Trade Updated", description: `Trade for ${tradeData.asset} has been updated.` });
    } else { // Adding new trade
      const newTrade: Trade = {
        ...tradeData,
        id: Date.now().toString(), // Simple ID generation
        status: finalStatus,
        pnl: newPnl,
        exitPrice: tradeData.exitPrice,
        exitTimestamp: tradeData.exitTimestamp,
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

  const summaryStats = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    const totalPnl = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = losingTrades.reduce((sum, t) => sum + Math.abs(t.pnl || 0), 0);
    const averageWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;

    return {
      totalPnl,
      winRate,
      totalTrades: closedTrades.length,
      averageWin,
      averageLoss,
      profitFactor: profitFactor === Infinity ? "N/A" : profitFactor.toFixed(2),
    };
  }, [trades]);


  if (!isClient) {
    return (
       <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center">
            <FileText className="mr-3 h-8 w-8 text-primary" /> Trading Journal
          </h1>
          <p className="text-muted-foreground">Log and analyze your trades to improve your skills.</p>
        </div>
        <Button onClick={openNewTradeDialog} size="lg">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Trade
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summaryStats.totalPnl >= 0 ? 'text-success' : 'text-destructive'}`}>
              {summaryStats.totalPnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Percent className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{summaryStats.totalTrades} trades closed</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.profitFactor}</div>
             <p className="text-xs text-muted-foreground">Avg Win: {summaryStats.averageWin.toLocaleString(undefined, { style: 'currency', currency: 'USD' })} / Avg Loss: {summaryStats.averageLoss.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Trades Table */}
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Trade History</CardTitle>
            <CardDescription>Detailed log of all your past and open trades.</CardDescription>
          </div>
          <Button variant="outline" size="sm" disabled>
            <ListFilter className="mr-2 h-4 w-4" /> Filter Trades
          </Button>
        </CardHeader>
        <CardContent>
          {trades.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">No trades logged yet.</p>
              <p className="text-sm text-muted-foreground">Click "Add New Trade" to get started logging your performance.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[100px]">Asset</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead className="min-w-[150px]">Entry Date</TableHead>
                    <TableHead>Entry Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="min-w-[150px]">Exit Date</TableHead>
                    <TableHead>Exit Price</TableHead>
                    <TableHead className="min-w-[120px]">Strategy</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.asset}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${trade.position === 'long' ? 'bg-success/20 text-success-foreground' : 'bg-destructive/20 text-destructive-foreground'}`}>
                          {trade.position.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(trade.entryTimestamp), "PPpp")}</TableCell>
                      <TableCell>{trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: trade.asset.toLowerCase().includes('usd') ? 2 : 5 })}</TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>{trade.exitTimestamp ? format(new Date(trade.exitTimestamp), "PPpp") : "N/A"}</TableCell>
                      <TableCell>{trade.exitPrice ? trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: trade.asset.toLowerCase().includes('usd') ? 2 : 5 }) : "N/A"}</TableCell>
                      <TableCell className="max-w-[150px] truncate hover:max-w-none hover:whitespace-normal">{trade.strategy || "N/A"}</TableCell>
                      <TableCell className={trade.pnl !== undefined ? (trade.pnl >= 0 ? 'text-success' : 'text-destructive') : ''}>
                        {trade.pnl !== undefined ? trade.pnl.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : "N/A"}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${trade.status === 'open' ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'}`}>
                            {trade.status.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTrade(trade)}>
                              <Edit3 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTrade(trade.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTradeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onSave={handleAddOrUpdateTrade} 
        tradeToEdit={tradeToEdit} 
      />
    </div>
  );
}

    
