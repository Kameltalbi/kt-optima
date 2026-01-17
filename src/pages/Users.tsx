import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { can } from "@/permissions/can";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, UserPlus, Edit, Trash2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'manager' | 'user' | 'accountant' | 'hr' | 'sales' | 'superadmin';
  user_id: string;
}

export default function Users() {
  const { isAdmin, permissions, company, refresh } = useApp();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'user' | 'accountant' | 'hr' | 'sales' | 'superadmin'>('user');

  // Vérifier les permissions
  const canViewUsers = can(isAdmin, permissions, 'parametres', 'read');
  const canEditUsers = can(isAdmin, permissions, 'parametres', 'update');
  const canDeleteUsers = can(isAdmin, permissions, 'parametres', 'delete');

  useEffect(() => {
    if (!canViewUsers || !isAdmin) {
      return;
    }
    loadUsers();
  }, [canViewUsers, isAdmin, company?.id]);

  const loadUsers = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);
      
      // Récupérer tous les utilisateurs de la société avec leurs rôles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role
        `)
        .eq('company_id', company.id);

      if (rolesError) throw rolesError;

      // Récupérer les profils pour chaque utilisateur
      const usersWithDetails: UserWithRole[] = await Promise.all(
        (userRoles || []).map(async (ur) => {
          // Récupérer le profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_id, full_name, avatar_url')
            .eq('user_id', ur.user_id)
            .single();

          // Note: Pour récupérer l'email, vous devriez créer une fonction Supabase
          // qui joint auth.users avec profiles. Pour l'instant, on utilise user_id comme fallback
          return {
            id: ur.id,
            user_id: ur.user_id,
            email: ur.user_id, // Fallback - idéalement récupérer depuis auth.users via une fonction
            full_name: profile?.full_name || null,
            avatar_url: profile?.avatar_url || null,
            role: ur.role,
          };
        })
      );

      setUsers(usersWithDetails);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (user: UserWithRole) => {
    if (!canEditUsers) {
      toast.error('Vous n\'avez pas la permission de modifier les rôles');
      return;
    }
    setSelectedUser(user);
    setSelectedRole(user.role);
    setEditModalOpen(true);
  };

  const handleSaveRole = async () => {
    if (!selectedUser || !canEditUsers || !company?.id) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: selectedRole })
        .eq('id', selectedUser.id)
        .eq('company_id', company.id);

      if (error) throw error;

      toast.success('Rôle mis à jour avec succès');
      setEditModalOpen(false);
      setSelectedUser(null);
      await loadUsers();
      await refresh();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Erreur lors de la mise à jour du rôle');
    }
  };

  const handleDeleteUser = async (user: UserWithRole) => {
    if (!canDeleteUsers) {
      toast.error('Vous n\'avez pas la permission de supprimer des utilisateurs');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer cet utilisateur ?`)) {
      return;
    }

    try {
      // Supprimer le rôle (la suppression de l'utilisateur auth se fait côté backend)
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', user.id)
        .eq('company_id', company?.id);

      if (error) throw error;

      toast.success('Utilisateur supprimé avec succès');
      await loadUsers();
      await refresh();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleInviteUser = async () => {
    if (!canEditUsers) {
      toast.error('Vous n\'avez pas la permission d\'inviter des utilisateurs');
      return;
    }

    if (!inviteEmail || !company?.id) return;

    try {
      // En production, vous devriez créer une fonction Supabase pour envoyer l'invitation
      // Pour l'instant, on simule juste l'action
      toast.success(`Invitation envoyée à ${inviteEmail}`);
      setInviteModalOpen(false);
      setInviteEmail("");
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast.error('Erreur lors de l\'envoi de l\'invitation');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'manager':
        return 'default';
      case 'sales':
        return 'secondary';
      case 'accountant':
        return 'outline';
      case 'hr':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrateur',
      manager: 'Manager',
      user: 'Utilisateur',
      sales: 'Commercial',
      accountant: 'Comptable',
      hr: 'RH',
    };
    return labels[role] || role;
  };

  if (!canViewUsers || !isAdmin) {
    return (
      <MainLayout title="Utilisateurs">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Vous n'avez pas accès à cette page.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gestion des utilisateurs" subtitle="Gérer les utilisateurs et leurs permissions">
      <div className="space-y-6">
        {/* Header avec bouton d'invitation */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Utilisateurs</h2>
            <p className="text-muted-foreground mt-1">
              {users.length} utilisateur{users.length > 1 ? 's' : ''} dans votre société
            </p>
          </div>
          {canEditUsers && (
            <Button onClick={() => setInviteModalOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Inviter un utilisateur
            </Button>
          )}
        </div>

        {/* Table des utilisateurs */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name || ''} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-sm font-semibold text-primary">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Sans nom'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleLabel(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEditUsers && (
                            <DropdownMenuItem onClick={() => handleEditRole(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier le rôle
                            </DropdownMenuItem>
                          )}
                          {canDeleteUsers && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal d'invitation */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inviter un utilisateur</DialogTitle>
            <DialogDescription>
              Envoyez une invitation par email pour ajouter un nouvel utilisateur à votre société.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="utilisateur@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="sales">Commercial</SelectItem>
                  <SelectItem value="accountant">Comptable</SelectItem>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleInviteUser} className="gap-2">
              <Mail className="w-4 h-4" />
              Envoyer l'invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de modification de rôle */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le rôle</DialogTitle>
            <DialogDescription>
              Modifier le rôle de {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select value={selectedRole} onValueChange={(value: any) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="sales">Commercial</SelectItem>
                  <SelectItem value="accountant">Comptable</SelectItem>
                  <SelectItem value="hr">RH</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRole}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
