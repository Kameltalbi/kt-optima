import { useState, useEffect } from "react";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Shield, Plus, MoreHorizontal, Trash2, Search, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SuperAdminUser {
  id: string;
  user_id: string;
  email?: string;
  full_name?: string;
  created_at: string | null;
}

export default function SuperAdminUsers() {
  const [superAdmins, setSuperAdmins] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadSuperAdmins();
  }, []);

  const loadSuperAdmins = async () => {
    try {
      // Get all superadmin roles with profile info
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, created_at")
        .eq("role", "superadmin");

      if (rolesError) throw rolesError;

      // Get profile info for each superadmin
      const superAdminsWithProfiles = await Promise.all(
        (rolesData || []).map(async (role) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", role.user_id)
            .single();

          return {
            id: role.id,
            user_id: role.user_id,
            full_name: profileData?.full_name || "Super Admin",
            email: "***@***.***", // Hidden for security
            created_at: role.created_at,
          };
        })
      );

      setSuperAdmins(superAdminsWithProfiles);
    } catch (error) {
      console.error("Error loading super admins:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les super admins",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuperAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un email valide",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Fonctionnalité en développement",
      description: "L'ajout de super admin sera disponible prochainement.",
    });
    setAddDialogOpen(false);
    setNewAdminEmail("");
  };

  const handleRemoveSuperAdmin = async (admin: SuperAdminUser) => {
    if (superAdmins.length <= 1) {
      toast({
        title: "Action impossible",
        description: "Vous devez garder au moins un super admin sur la plateforme.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", admin.id);

      if (error) throw error;

      setSuperAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      toast({
        title: "Super Admin supprimé",
        description: "Les droits de super admin ont été révoqués.",
      });
    } catch (error) {
      console.error("Error removing super admin:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le super admin",
        variant: "destructive",
      });
    }
  };

  const filteredAdmins = searchQuery
    ? superAdmins.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : superAdmins;

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Utilisateurs Plateforme</h1>
            <p className="text-muted-foreground mt-1">
              Gérer les comptes Super Admin de la plateforme
            </p>
          </div>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter Super Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Super Admin</DialogTitle>
                <DialogDescription>
                  Accordez les droits de super administrateur à un utilisateur existant.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email de l'utilisateur</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddSuperAdmin}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Super Administrateurs</h3>
              <p className="text-sm text-muted-foreground">
                Les super admins ont un accès complet à la gestion de la plateforme. Ils ne voient
                pas les données métier des entreprises.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un super admin..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Super Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Super Admins</CardTitle>
            <CardDescription>
              {superAdmins.length} super administrateur{superAdmins.length > 1 ? "s" : ""} sur la
              plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date d'ajout</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmins.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Aucun super admin trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAdmins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {admin.full_name?.charAt(0)?.toUpperCase() || "S"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{admin.full_name}</p>
                              <p className="text-sm text-muted-foreground">{admin.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                            <Shield className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {admin.created_at
                            ? new Date(admin.created_at).toLocaleDateString("fr-FR")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRemoveSuperAdmin(admin)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Révoquer les droits
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
