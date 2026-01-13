import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  FileText,
  Receipt,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Données mockées
const salesData = [
  { month: "Jan", ca: 125000 },
  { month: "Fév", ca: 142000 },
  { month: "Mar", ca: 138000 },
  { month: "Avr", ca: 165000 },
  { month: "Mai", ca: 152000 },
  { month: "Juin", ca: 178000 },
];

const caByClient = [
  { id: 1, name: "Société Alpha", ca: 125000, percentage: 18.5 },
  { id: 2, name: "Entreprise Beta", ca: 98000, percentage: 14.5 },
  { id: 3, name: "Commerce Gamma", ca: 85000, percentage: 12.6 },
  { id: 4, name: "Services Delta", ca: 72000, percentage: 10.7 },
  { id: 5, name: "Industrie Epsilon", ca: 65000, percentage: 9.6 },
  { id: 6, name: "Groupe Zeta", ca: 58000, percentage: 8.6 },
  { id: 7, name: "Corporation Eta", ca: 52000, percentage: 7.7 },
  { id: 8, name: "Société Theta", ca: 45000, percentage: 6.7 },
];

const caByProduct = [
  { id: 1, name: "Produit A", ca: 189000, quantity: 450, avgPrice: 420 },
  { id: 2, name: "Produit B", ca: 167000, quantity: 320, avgPrice: 522 },
  { id: 3, name: "Produit C", ca: 156000, quantity: 280, avgPrice: 557 },
  { id: 4, name: "Produit D", ca: 142000, quantity: 210, avgPrice: 676 },
  { id: 5, name: "Produit E", ca: 135000, quantity: 180, avgPrice: 750 },
  { id: 6, name: "Produit F", ca: 98000, quantity: 150, avgPrice: 653 },
  { id: 7, name: "Produit G", ca: 85000, quantity: 120, avgPrice: 708 },
  { id: 8, name: "Produit H", ca: 72000, quantity: 100, avgPrice: 720 },
];

const COLORS = ["hsl(144, 26%, 45%)", "hsl(198, 10%, 21%)", "hsl(29, 47%, 57%)"];

export default function SalesStats() {
  const [period, setPeriod] = useState("6months");

  const totalCA = salesData.reduce((sum, d) => sum + d.ca, 0);
  const totalCAByClient = caByClient.reduce((sum, c) => sum + c.ca, 0);
  const totalCAByProduct = caByProduct.reduce((sum, p) => sum + p.ca, 0);
  const totalQuantity = caByProduct.reduce((sum, p) => sum + p.quantity, 0);
  const averageBasket = totalCA / (salesData.length * 30); // Approximation

  const growth = ((salesData[salesData.length - 1].ca - salesData[0].ca) / salesData[0].ca) * 100;

  return (
    <MainLayout
      title="Statistiques des ventes"
      subtitle="Analysez vos performances commerciales"
    >
      <div className="space-y-6">
        {/* Filtres */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Période:</span>
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 derniers jours</SelectItem>
                  <SelectItem value="30days">30 derniers jours</SelectItem>
                  <SelectItem value="3months">3 derniers mois</SelectItem>
                  <SelectItem value="6months">6 derniers mois</SelectItem>
                  <SelectItem value="12months">12 derniers mois</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                Exporter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires total</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {totalCA.toLocaleString()} MAD
                  </p>
                  <p className="text-xs text-success mt-1">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    {growth.toFixed(1)}% vs période précédente
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CA par client</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {(totalCAByClient / caByClient.length).toLocaleString(undefined, { maximumFractionDigits: 0 })} MAD
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Moyenne par client
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">CA par produit</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {(totalCAByProduct / caByProduct.length).toLocaleString(undefined, { maximumFractionDigits: 0 })} MAD
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Moyenne par produit
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <ShoppingCart className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Panier moyen</p>
                  <p className="text-2xl font-bold mt-1 text-foreground">
                    {averageBasket.toLocaleString(undefined, { maximumFractionDigits: 0 })} MAD
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Par transaction
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-success/10">
                  <Receipt className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Évolution du CA */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Évolution du chiffre d'affaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(144, 26%, 45%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(144, 26%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => `${value.toLocaleString()} MAD`}
                  />
                  <Area
                    type="monotone"
                    dataKey="ca"
                    stroke="hsl(144, 26%, 45%)"
                    strokeWidth={3}
                    fill="url(#caGradient)"
                    name="Chiffre d'affaires"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CA par client */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5" />
              Chiffre d'affaires par client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={caByClient} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      type="number"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `${value.toLocaleString()} MAD`}
                    />
                    <Bar dataKey="ca" fill="hsl(144, 26%, 45%)" radius={[0, 8, 8, 0]} name="CA" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              {/* Tableau */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Client</TableHead>
                      <TableHead className="text-right font-semibold">CA</TableHead>
                      <TableHead className="text-right font-semibold">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caByClient.map((client) => (
                      <TableRow key={client.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {client.ca.toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {client.percentage}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CA par produit */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Chiffre d'affaires par produit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique */}
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={caByProduct} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      type="number"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `${value.toLocaleString()} MAD`}
                    />
                    <Bar dataKey="ca" fill="hsl(29, 47%, 57%)" radius={[0, 8, 8, 0]} name="CA" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              {/* Tableau */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Produit</TableHead>
                      <TableHead className="text-right font-semibold">CA</TableHead>
                      <TableHead className="text-right font-semibold">Qté</TableHead>
                      <TableHead className="text-right font-semibold">Prix moy.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caByProduct.map((product) => (
                      <TableRow key={product.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {product.ca.toLocaleString()} MAD
                        </TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {product.avgPrice.toLocaleString()} MAD
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  );
}
