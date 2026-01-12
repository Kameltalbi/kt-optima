import { BarChart3 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", revenue: 45000, expenses: 28000 },
  { month: "Fév", revenue: 52000, expenses: 31000 },
  { month: "Mar", revenue: 48000, expenses: 29000 },
  { month: "Avr", revenue: 61000, expenses: 35000 },
  { month: "Mai", revenue: 55000, expenses: 32000 },
  { month: "Juin", revenue: 67000, expenses: 38000 },
];

export function RevenueChart() {
  return (
    <div className="erp-card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-accent/10">
          <BarChart3 className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Revenus & Dépenses</h3>
          <p className="text-sm text-muted-foreground">6 derniers mois</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: 'hsl(217, 20%, 45%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(214, 20%, 88%)' }}
            />
            <YAxis 
              tick={{ fill: 'hsl(217, 20%, 45%)', fontSize: 12 }}
              axisLine={{ stroke: 'hsl(214, 20%, 88%)' }}
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(214, 20%, 88%)',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px hsl(222, 47%, 11%, 0.1)'
              }}
              formatter={(value: number) => [`${value.toLocaleString()} MAD`, '']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={2}
              fill="url(#revenueGradient)"
              name="Revenus"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              name="Dépenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-secondary" />
          <span className="text-sm text-muted-foreground">Revenus</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-accent" />
          <span className="text-sm text-muted-foreground">Dépenses</span>
        </div>
      </div>
    </div>
  );
}
