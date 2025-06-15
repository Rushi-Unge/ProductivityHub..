
"use client"

import { useState, useEffect } from 'react';
import AssetChartCard, { type ChartCardData } from '@/components/chart-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

const generateMockData = (name: string, basePrice: number): ChartCardData => {
  const dataPoints = 7;
  const data = [];
  let currentPrice = basePrice;
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (dataPoints - 1 - i));
    data.push({ date: date.toISOString().split('T')[0], value: parseFloat(currentPrice.toFixed(2)) });
    currentPrice += (Math.random() - 0.5) * (basePrice * 0.1); // Fluctuate by up to 10%
    currentPrice = Math.max(0, currentPrice); // Ensure price doesn't go negative
  }
  const change = data[dataPoints - 1].value - data[0].value;
  const changePercent = (change / data[0].value) * 100;
  return {
    name,
    price: data[dataPoints - 1].value,
    change: change,
    changePercent: changePercent,
    data,
    currencySymbol: name.includes("Coin") ? "" : "$", // Example: no $ for crypto
  };
};

const mockWatchlist: ChartCardData[] = [
  generateMockData("AlphaCorp (AC)", 150.75),
  generateMockData("BetaTech (BT)", 275.50),
  generateMockData("GammaCoin (GC)", 2.35),
];

const mockPortfolio: ChartCardData[] = [
  generateMockData("Delta Solutions (DS)", 88.20),
  generateMockData("Epsilon Ent. (EE)", 120.00),
];

const mockTrending: ChartCardData[] = [
  generateMockData("ZetaChain (ZC)", 0.85),
  generateMockData("Omega Inc. (OI)", 310.90),
  generateMockData("Kappa Global (KG)", 55.40),
];

export default function AnalyticsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
       <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-8 w-full max-w-md" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-80 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Market Analytics</h1>
        <p className="text-muted-foreground">Stay updated with the latest market trends and your portfolio.</p>
      </div>

      <Tabs defaultValue="watchlist" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="watchlist">
          <AnalyticsGrid assets={mockWatchlist} />
        </TabsContent>
        <TabsContent value="portfolio">
          <AnalyticsGrid assets={mockPortfolio} />
        </TabsContent>
        <TabsContent value="trending">
          <AnalyticsGrid assets={mockTrending} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface AnalyticsGridProps {
  assets: ChartCardData[];
}

function AnalyticsGrid({ assets }: AnalyticsGridProps) {
  if (assets.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No assets to display in this category.</p>;
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {assets.map(asset => (
        <AssetChartCard key={asset.name} asset={asset} />
      ))}
    </div>
  );
}
