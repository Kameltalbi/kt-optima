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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, MoreHorizontal, Users, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Client, Supplier } from "@/types/database";

const mockClients: Client[] = [
  { id: "1", name: "Société Alpha", phone: "+212 522 123 456", email: "contact@alpha.ma", address: "Casablanca", company_id: "1", balance: 15000 },
  { id: "2", name: "Entreprise Beta", phone: "+212 537 654 321", email: "info@beta.ma", address: "Rabat", company_id: "1", balance: 8500 },
  { id: "3", name: "Commerce Gamma", phone: "+212 528 987 654", email: "sales@gamma.ma", address: "Marrakech", company_id: "1", balance: -2200 },
  { id: "4", name: "Services Delta", phone: "+212 535 111 222", email: "contact@delta.ma", address: "Fès", company_id: "1", balance: 0 },
];

const mockSuppliers: Supplier[] = [
  { id: "1", name: "Fournisseur Pro", phone: "+212 522 333 444", email: "pro@supplier.ma", address: "Casablanca", company_id: "1", balance: -25000 },
  { id: "2", name: "Import Express", phone: "+212 537 555 666", email: "contact@import.ma", address: "Tanger", company_id: "1", balance: -12000 },
  { id: "3", name: "Materials Plus", phone: "+212 528 777 888", email: "info@materials.ma", address: "Agadir", company_id: "1", balance: 0 },
];

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <MainLayout
      title="Clients & Fournisseurs"
      subtitle="Gérez vos relations commerciales"
    >
      <Tabs defaultValue="clients" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList className="bg-muted">
            <TabsTrigger value="clients" className="gap-2">
              <Users className="w-4 h-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Truck className="w-4 h-4" />
              Fournisseurs
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-secondary hover:bg-secondary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau client</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input id="name" placeholder="Nom du client" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" placeholder="+212..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="email@example.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input id="address" placeholder="Adresse complète" />
                  </div>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    Enregistrer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="clients" className="animate-fade-in">
          <div className="erp-card p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="erp-table-header">
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockClients
                  .filter((c) =>
                    c.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.address}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-semibold",
                            client.balance > 0 && "text-success",
                            client.balance < 0 && "text-destructive"
                          )}
                        >
                          {client.balance.toLocaleString()} MAD
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="animate-fade-in">
          <div className="erp-card p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="erp-table-header">
                  <TableHead>Nom</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Ville</TableHead>
                  <TableHead className="text-right">Solde</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSuppliers
                  .filter((s) =>
                    s.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((supplier) => (
                    <TableRow key={supplier.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell>{supplier.address}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-semibold",
                            supplier.balance >= 0 && "text-success",
                            supplier.balance < 0 && "text-accent"
                          )}
                        >
                          {supplier.balance.toLocaleString()} MAD
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
