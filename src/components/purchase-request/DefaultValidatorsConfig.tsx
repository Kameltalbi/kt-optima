import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, Users, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyUsers } from '@/hooks/use-company-users';

interface DefaultValidator {
  niveau: number;
  validator_type: 'role' | 'user' | null;
  role_name: string | null;
  user_id: string | null;
}

export default function DefaultValidatorsConfig() {
  const { company } = useAuth();
  const { users } = useCompanyUsers();
  const [validators, setValidators] = useState<DefaultValidator[]>([
    { niveau: 1, validator_type: null, role_name: null, user_id: null },
    { niveau: 2, validator_type: null, role_name: null, user_id: null },
    { niveau: 3, validator_type: null, role_name: null, user_id: null },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company?.id) {
      loadDefaultValidators();
    }
  }, [company?.id]);

  const loadDefaultValidators = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('purchase_request_default_validators')
        .select('*')
        .eq('company_id', company.id)
        .order('niveau', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = table doesn't exist, on ignore
        throw error;
      }

      if (data && data.length > 0) {
        const validatorsMap = data.reduce((acc, v) => {
          acc[v.niveau] = v;
          return acc;
        }, {} as Record<number, any>);

        setValidators([
          validatorsMap[1] || { niveau: 1, validator_type: null, role_name: null, user_id: null },
          validatorsMap[2] || { niveau: 2, validator_type: null, role_name: null, user_id: null },
          validatorsMap[3] || { niveau: 3, validator_type: null, role_name: null, user_id: null },
        ]);
      }
    } catch (error: any) {
      console.error('Error loading default validators:', error);
      // Ne pas afficher d'erreur si la table n'existe pas encore
      if (error.code !== 'PGRST116') {
        toast.error('Erreur lors du chargement des validateurs par défaut');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!company?.id) return;

    try {
      setLoading(true);

      // Supprimer les anciens validateurs par défaut
      await supabase
        .from('purchase_request_default_validators')
        .delete()
        .eq('company_id', company.id);

      // Insérer les nouveaux
      const validatorsToInsert = validators
        .filter(v => v.validator_type !== null)
        .map(v => ({
          company_id: company.id,
          niveau: v.niveau,
          validator_type: v.validator_type!,
          role_name: v.validator_type === 'role' ? v.role_name : null,
          user_id: v.validator_type === 'user' ? v.user_id : null,
        }));

      if (validatorsToInsert.length > 0) {
        const { error } = await supabase
          .from('purchase_request_default_validators')
          .insert(validatorsToInsert);

        if (error) throw error;
      }

      toast.success('Validateurs par défaut sauvegardés');
    } catch (error: any) {
      console.error('Error saving default validators:', error);
      toast.error(`Erreur: ${error.message || 'Erreur lors de la sauvegarde'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateValidator = (niveau: number, updates: Partial<DefaultValidator>) => {
    setValidators(prev =>
      prev.map(v =>
        v.niveau === niveau
          ? { ...v, ...updates }
          : v
      )
    );
  };

  // Récupérer les rôles uniques depuis les utilisateurs
  const availableRoles = Array.from(new Set(users.map(u => u.role))).sort();

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Validateurs par défaut par niveau
        </CardTitle>
        <CardDescription className="text-xs">
          Configurez les validateurs par défaut pour chaque niveau de validation. Ces validateurs seront utilisés lors de la création de nouveaux paliers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((niveau) => {
            const validator = validators.find(v => v.niveau === niveau) || {
              niveau,
              validator_type: null,
              role_name: null,
              user_id: null,
            };

            return (
              <div key={niveau} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Niveau {niveau}</Badge>
                  {validator.validator_type && (
                    <Badge variant="secondary">
                      {validator.validator_type === 'role' ? 'Rôle' : 'Utilisateur'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor={`type-${niveau}`}>Type de validateur</Label>
                  <Select
                    value={validator.validator_type || 'none'}
                    onValueChange={(value: 'role' | 'user' | 'none') => {
                      if (value === 'none') {
                        updateValidator(niveau, { validator_type: null, role_name: null, user_id: null });
                      } else {
                        updateValidator(niveau, {
                          validator_type: value,
                          role_name: value === 'role' ? validator.role_name : null,
                          user_id: value === 'user' ? validator.user_id : null,
                        });
                      }
                    }}
                  >
                    <SelectTrigger id={`type-${niveau}`}>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun</SelectItem>
                      <SelectItem value="role">Par rôle (RH)</SelectItem>
                      <SelectItem value="user">Par utilisateur (RH)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {validator.validator_type === 'role' && (
                  <div>
                    <Label htmlFor={`role-${niveau}`}>Rôle *</Label>
                    <Select
                      value={validator.role_name || undefined}
                      onValueChange={(value) =>
                        updateValidator(niveau, { role_name: value })
                      }
                    >
                      <SelectTrigger id={`role-${niveau}`}>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.length > 0 ? (
                          availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0).toUpperCase() + role.slice(1)}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Aucun rôle disponible (créez des rôles dans le module RH)
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {validator.validator_type === 'user' && (
                  <div>
                    <Label htmlFor={`user-${niveau}`}>Utilisateur *</Label>
                    <Select
                      value={validator.user_id || undefined}
                      onValueChange={(value) =>
                        updateValidator(niveau, { user_id: value })
                      }
                    >
                      <SelectTrigger id={`user-${niveau}`}>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.length > 0 ? (
                          users.map((user) => (
                            <SelectItem key={user.userId} value={user.userId}>
                              {user.fullName} ({user.role})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Aucun utilisateur disponible (créez des utilisateurs dans le module RH)
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>

        <div className="flex justify-end pt-4 mt-6">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer les validateurs par défaut'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
