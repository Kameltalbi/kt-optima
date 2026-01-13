import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Users, 
  Edit,
  Trash2,
  Eye,
  FileText,
  Phone,
  Mail,
  MapPin,
  TrendingDown,
  DollarSign,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types/database";

const mockSuppliers: Supplier[] = [
  { id: "1", name: "Fournisseur Alpha", phone: "+212 522 123 456", email: "contact@alpha.ma", address: "Casablanca", tax_number: "123456789", company_id: "1", balance: -15000 },
  { id: "2", name: "Entreprise Beta Supply", phone: "+212 537 654 321", email: "info@beta.ma", address: "Rabat", tax_number: "987654321", company_id: "1", balance: -8500 },
  { id: "3", name: "Commerce Gamma Pro", phone: "+212 528 987 654", email: "sales@gamma.ma", address: "Marrakech", tax_number: "456789123", company_id: "1", balance: -2200 },
  { id: "4", name: "Services Delta Corp", phone: "+212 535 111 222", email: "contact@delta.ma", address: "Fès", tax_number: "789123456", company_id: "1", balance: 0 },
  { id: "5", name: "Tech Solutions Supply", phone: "+212 522 999 888", email: "info@tech.ma", address: "Casablanca", tax_number: "321654987", company_id: "1", balance: -32000 },
  { id: "6", name: "Global Trade Supply", phone: "+212 537 777 666", email: "contact@global.ma", address: "Tanger", tax_number: "654987321", company_id: "1", balance: -12500 },
];

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredSuppliers = mockSuppliers.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm) ||
    s.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.tax_number && s.tax_number.includes(searchTerm))
  );

  const totalSuppliers = mockSuppliers.length;
  const totalBalance = mockSuppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
  const activeSuppliers = mockSuppliers.filter(s => s.balance < 0).length;

  return (
    <MainLayout
      title="Fournisseurs"
      subtitle="Gérez votre base de fournisseurs"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total fournisseurs</p>
                  <p className="text-2xl font-bold mt-1">{totalSuppliers}</p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dettes totales</p>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {Math.abs(totalBalance).toLocaleString()} MAD
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-destructive/10">
                  <DollarSign className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fournisseurs actifs</p>
                  <p className="text-2xl font-bold mt-1">{activeSuppliers}</p>
                </div>
                <div className="p-3 rounded-lg bg-accent/10">
                  <TrendingDown className="w-5 h-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email, téléphone, code TVA ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau fournisseur
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouveau fournisseur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du fournisseur *</Label>
                  <Input id="name" placeholder="Fournisseur Alpha" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_number">Code TVA / Identifiant fiscal</Label>
                  <Input id="tax_number" placeholder="123456789" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" placeholder="+212 522 123 456" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="contact@example.ma" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" placeholder="123 Rue Principale, Casablanca" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" placeholder="Casablanca" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal">Code postal</Label>
                    <Input id="postal" placeholder="20000" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button className="flex-1 bg-primary hover:bg-primary/90">
                    Enregistrer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Suppliers Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Fournisseur</TableHead>
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Code TVA</TableHead>
                    <TableHead className="font-semibold">Localisation</TableHead>
                    <TableHead className="text-right font-semibold">Solde</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun fournisseur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">
                                {supplier.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold">{supplier.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {supplier.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {supplier.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{supplier.phone}</span>
                              </div>
                            )}
                            {supplier.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">{supplier.email}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {supplier.tax_number ? (
                            <span className="text-sm font-medium">{supplier.tax_number}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {supplier.address && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                              <span>{supplier.address}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span
                              className={cn(
                                "font-bold text-sm",
                                supplier.balance < 0 && "text-destructive",
                                supplier.balance === 0 && "text-muted-foreground"
                              )}
                            >
                              {supplier.balance.toLocaleString()} MAD
                            </span>
                            {supplier.balance < 0 && (
                              <Badge variant="destructive" className="text-[10px]">
                                Dette
                              </Badge>
                            )}
                            {supplier.balance === 0 && (
                              <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">
                                Soldé
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="w-4 h-4 mr-2" />
                                Factures
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
