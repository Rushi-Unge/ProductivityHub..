
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export interface ChartCardData {
  name: string;
  price: number;
  change: number;
  changePercent: number;
  data: { date: string; value: number }[];
  currencySymbol?: string;
}

interface ChartCardProps {
  asset: ChartCardData;
}

export default function AssetChartCard({ asset }: ChartCardProps) {
  const isPositiveChange = asset.changePercent >= 0;
  const currency = asset.currencySymbol || "$";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-semibold">{asset.name}</CardTitle>
            <CardDescription>Last 7 Days Performance</CardDescription>
          </div>
          {isPositiveChange ? <TrendingUp className="h-6 w-6 text-success" /> : <TrendingDown className="h-6 w-6 text-destructive" />}
        </div>
      </CardHeader>
      <CardContent className="pb-0">
        <div className="text-3xl font-bold mb-1">{currency}{asset.price.toLocaleString()}</div>
        <div className={`text-sm font-medium flex items-center ${isPositiveChange ? 'text-success' : 'text-destructive'}`}>
          {isPositiveChange ? '+' : ''}{currency}{asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)
        </div>
        <div className="h-[100px] w-full mt-4 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={asset.data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
               <defs>
                <linearGradient id={`color${asset.name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositiveChange ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={isPositiveChange ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)'}}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${currency}${value.toFixed(2)}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={isPositiveChange ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                fillOpacity={1}
                strokeWidth={2}
                fill={`url(#color${asset.name.replace(/\s+/g, '')})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-4">
        <Button className="flex-1 bg-success/80 hover:bg-success text-success-foreground">Buy</Button>
        <Button variant="outline" className="flex-1 border-destructive/80 text-destructive hover:bg-destructive/10 hover:text-destructive">Sell</Button>
      </CardFooter>
    </Card>
  );
}
