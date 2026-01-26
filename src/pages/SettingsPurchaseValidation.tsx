import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/hooks/use-currency';
import { useCompanyUsers } from '@/hooks/use-company-users';
import type { BudgetTier, TierValidator, ValidationSettings } from '@/hooks/use-purchase-request-validations';

export default function SettingsPurchaseValidation() {
  const { company } = useAuth();
  const { formatCurrency } = useCurrency({ companyId: company?.id, companyCurrency: company?.currency });
  const { users } = useCompanyUsers();
  const [settings, setSettings] = useState<ValidationSettings | null>(null);
  const [tiers, setTiers] = useState<BudgetTier[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTierDialogOpen, setIsTierDialogOpen] = useState(false);
  const [isValidatorDialogOpen, setIsValidatorDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<BudgetTier | null>(null);
  const [editingTier, setEditingTier] = useState<Partial<BudgetTier> | null>(null);
  const [editingValidator, setEditingValidator] = useState<Partial<TierValidator> | null>(null);

  useEffect(() => {
    if (company?.id) {
      loadSettings();
      loadTiers();
    }
  }, [company?.id]);

  const loadSettings = async () => {
    if (!company?.id) return;
    try {
      const { data, error } = await supabase
        .from('purchase_request_validation_settings')
        .select('*')
        .eq('company_id', company.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: newSettings } = await supabase
          .from('purchase_request_validation_settings')
          .insert({ company_id: company.id, enabled: false, require_exception_approval: true })
          .select()
          .single();
        if (newSettings) setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    }
  };

  const loadTiers = async () => {
    if (!company?.id) return;
    try {
      setLoading(true);
      // Charger les paliers
      const { data: tiersData, error: tiersError } = await supabase
        .from('purchase_request_budget_tiers')
        .select('*')
        .eq('company_id', company.id)
        .order('ordre', { ascending: true });
      
      if (tiersError) {
        console.error('Erreur Supabase lors du chargement des paliers:', tiersError);
        toast.error(`Erreur: ${tiersError.message}`);
        throw tiersError;
      }

      // Charger les validateurs pour chaque palier
      const tiersWithValidators = await Promise.all(
        (tiersData || []).map(async (tier) => {
          const { data: validatorsData, error: validatorsError } = await supabase
            .from('purchase_request_tier_validators')
            .select('*')
            .eq('tier_id', tier.id)
            .order('niveau_validation', { ascending: true })
            .order('ordre', { ascending: true });

          if (validatorsError) {
            console.error(`Erreur lors du chargement des validateurs pour le palier ${tier.id}:`, validatorsError);
            return { ...tier, validators: [] };
          }

          // Charger les informations des utilisateurs si nécessaire
          const validatorsWithUsers = await Promise.all(
            (validatorsData || []).map(async (validator) => {
              if (validator.validator_type === 'user' && validator.user_id) {
                // Récupérer les infos utilisateur depuis profiles
                const { data: profileData } = await supabase
                  .from('profiles')
                  .select('id, full_name, email')
                  .eq('user_id', validator.user_id)
                  .single();
                
                return {
                  ...validator,
                  user: profileData ? {
                    id: profileData.id,
                    full_name: profileData.full_name,
                    email: profileData.email || ''
                  } : null
                };
              }
              return validator;
            })
          );

          return {
            ...tier,
            validators: validatorsWithUsers
          };
        })
      );

      console.log('Paliers chargés:', tiersWithValidators);
      setTiers(tiersWithValidators as BudgetTier[]);
    } catch (error: any) {
      console.error('Error loading tiers:', error);
      toast.error(`Erreur lors du chargement des paliers: ${error.message || 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<ValidationSettings>) => {
    if (!company?.id || !settings) return;
    try {
      const { error } = await supabase
        .from('purchase_request_validation_settings')
        .update(updates)
        .eq('id', settings.id);
      if (error) throw error;
      setSettings({ ...settings, ...updates });
      toast.success('Paramètres mis à jour');
    } catch (error: any) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleSaveTier = async () => {
    if (!company?.id || !editingTier) return;
    try {
      if (editingTier.id) {
        const { error } = await supabase
          .from('purchase_request_budget_tiers')
          .update({
            montant_min: editingTier.montant_min,
            montant_max: editingTier.montant_max === undefined ? null : editingTier.montant_max,
            nombre_validations: editingTier.nombre_validations,
            ordre: editingTier.ordre,
            actif: editingTier.actif,
          })
          .eq('id', editingTier.id);
        if (error) throw error;
        toast.success('Palier mis à jour');
      } else {
        // Calculer automatiquement l'ordre si non spécifié ou en conflit
        let ordreFinal = editingTier.ordre || tiers.length + 1;
        
        // Vérifier si l'ordre existe déjà pour cette entreprise
        const existingTierWithOrder = tiers.find(t => t.ordre === ordreFinal && t.id !== editingTier.id);
        if (existingTierWithOrder) {
          // Trouver le prochain ordre disponible
          const maxOrdre = Math.max(...tiers.map(t => t.ordre || 0), 0);
          ordreFinal = maxOrdre + 1;
        }
        
        const { error } = await supabase
          .from('purchase_request_budget_tiers')
          .insert({
            company_id: company.id,
            montant_min: editingTier.montant_min!,
            montant_max: editingTier.montant_max === undefined ? null : editingTier.montant_max,
            nombre_validations: editingTier.nombre_validations ?? 1,
            ordre: ordreFinal,
            actif: editingTier.actif ?? true,
          });
        if (error) {
          console.error('Erreur lors de la création du palier:', error);
          throw error;
        }
        toast.success('Palier créé');
      }
      setIsTierDialogOpen(false);
      setEditingTier(null);
      await loadTiers();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Validation par paliers budgétaires</CardTitle>
          <CardDescription>
            Configurez le système de validation automatique des demandes d'achat selon leur montant
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enabled">Activer la validation par paliers</Label>
              <p className="text-sm text-muted-foreground">
                Active le système de validation automatique basé sur le montant
              </p>
            </div>
            <Switch
              id="enabled"
              checked={settings?.enabled || false}
              onCheckedChange={(checked) => updateSettings({ enabled: checked })}
            />
          </div>
          {settings?.enabled && (
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="exception">Validation exceptionnelle requise</Label>
                <p className="text-sm text-muted-foreground">
                  Exiger une validation exceptionnelle si le montant dépasse le palier maximum
                </p>
              </div>
              <Switch
                id="exception"
                checked={settings?.require_exception_approval || false}
                onCheckedChange={(checked) => updateSettings({ require_exception_approval: checked })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {settings?.enabled && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Paliers budgétaires</CardTitle>
                <CardDescription>
                  Définissez les paliers de montant et le nombre de validations requis
                </CardDescription>
              </div>
              <Button onClick={() => {
                setEditingTier({ montant_min: 0, montant_max: null, nombre_validations: 1, ordre: tiers.length + 1, actif: true });
                setIsTierDialogOpen(true);
              }} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un palier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Chargement...</p>
            ) : tiers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun palier configuré. Cliquez sur "Ajouter un palier" pour commencer.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tiers.map((tier) => (
                  <Card key={tier.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Palier {tier.ordre}</Badge>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => {
                            setEditingTier(tier);
                            setIsTierDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={async () => {
                            if (confirm('Supprimer ce palier ?')) {
                              await supabase.from('purchase_request_budget_tiers').delete().eq('id', tier.id);
                              await loadTiers();
                            }
                          }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Montant minimum</Label>
                          <p className="font-semibold">{formatCurrency(tier.montant_min)}</p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Montant maximum</Label>
                          <p className="font-semibold">
                            {tier.montant_max === null ? 'Infini' : formatCurrency(tier.montant_max)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Validations requises</Label>
                          <p className="font-semibold">{tier.nombre_validations}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Validateurs ({tier.validators?.length || 0})</Label>
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedTier(tier);
                            setEditingValidator({ validator_type: 'role', niveau_validation: (tier.validators?.length || 0) + 1 });
                            setIsValidatorDialogOpen(true);
                          }}>
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter
                          </Button>
                        </div>
                        {tier.validators && tier.validators.length > 0 && (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Niveau</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Validateur</TableHead>
                                <TableHead className="w-20">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {tier.validators.sort((a, b) => a.niveau_validation - b.niveau_validation).map((v) => (
                                <TableRow key={v.id}>
                                  <TableCell>{v.niveau_validation}</TableCell>
                                  <TableCell><Badge variant="outline">{v.validator_type === 'role' ? 'Rôle' : 'Utilisateur'}</Badge></TableCell>
                                  <TableCell>{v.validator_type === 'role' ? v.role_name : (v.user?.full_name || v.user?.email || 'N/A')}</TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="icon" onClick={async () => {
                                      await supabase.from('purchase_request_tier_validators').delete().eq('id', v.id);
                                      await loadTiers();
                                    }}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={isTierDialogOpen} onOpenChange={setIsTierDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTier?.id ? 'Modifier le palier' : 'Nouveau palier'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="montant_min">Montant minimum *</Label>
              <Input
                id="montant_min"
                type="number"
                step="0.01"
                value={editingTier?.montant_min || 0}
                onChange={(e) => setEditingTier({ ...editingTier, montant_min: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="montant_max">Montant maximum (vide = infini)</Label>
              <Input
                id="montant_max"
                type="number"
                step="0.01"
                value={editingTier?.montant_max === null || editingTier?.montant_max === undefined ? '' : editingTier.montant_max}
                onChange={(e) => setEditingTier({ ...editingTier, montant_max: e.target.value === '' ? null : (parseFloat(e.target.value) || null) })}
              />
            </div>
            <div>
              <Label htmlFor="nombre_validations">Nombre de validations *</Label>
              <Input
                id="nombre_validations"
                type="number"
                min="0"
                value={editingTier?.nombre_validations ?? 1}
                onChange={(e) => setEditingTier({ ...editingTier, nombre_validations: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                0 = pas de validation (approuvé automatiquement)
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="actif"
                checked={editingTier?.actif ?? true}
                onCheckedChange={(checked) => setEditingTier({ ...editingTier, actif: checked })}
              />
              <Label htmlFor="actif">Palier actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTierDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveTier}><Save className="w-4 h-4 mr-2" />Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isValidatorDialogOpen} onOpenChange={setIsValidatorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un validateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="niveau">Niveau de validation *</Label>
              <Input
                id="niveau"
                type="number"
                min="1"
                value={editingValidator?.niveau_validation || 1}
                onChange={(e) => setEditingValidator({ ...editingValidator, niveau_validation: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="validator_type">Type *</Label>
              <Select
                value={editingValidator?.validator_type || 'role'}
                onValueChange={(value: 'role' | 'user') => setEditingValidator({ ...editingValidator, validator_type: value, role_name: value === 'role' ? editingValidator?.role_name : null, user_id: value === 'user' ? editingValidator?.user_id : null })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="role">Par rôle</SelectItem>
                  <SelectItem value="user">Par utilisateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editingValidator?.validator_type === 'role' ? (
              <div>
                <Label htmlFor="role_name">Rôle *</Label>
                <Select
                  value={editingValidator?.role_name || ''}
                  onValueChange={(value) => setEditingValidator({ ...editingValidator, role_name: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Sélectionner un rôle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="accountant">Comptable</SelectItem>
                    <SelectItem value="hr">RH</SelectItem>
                    <SelectItem value="sales">Commercial</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div>
                <Label htmlFor="user_id">Utilisateur *</Label>
                <Select
                  value={editingValidator?.user_id || ''}
                  onValueChange={(value) => setEditingValidator({ ...editingValidator, user_id: value })}
                >
                  <SelectTrigger><SelectValue placeholder="Sélectionner un utilisateur" /></SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>{user.fullName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsValidatorDialogOpen(false)}>Annuler</Button>
            <Button onClick={async () => {
              if (!selectedTier || !editingValidator) return;
              try {
                if (editingValidator.id) {
                  await supabase.from('purchase_request_tier_validators').update({
                    validator_type: editingValidator.validator_type,
                    role_name: editingValidator.validator_type === 'role' ? editingValidator.role_name : null,
                    user_id: editingValidator.validator_type === 'user' ? editingValidator.user_id : null,
                    niveau_validation: editingValidator.niveau_validation,
                  }).eq('id', editingValidator.id);
                  toast.success('Validateur mis à jour');
                } else {
                  await supabase.from('purchase_request_tier_validators').insert({
                    tier_id: selectedTier.id,
                    validator_type: editingValidator.validator_type!,
                    role_name: editingValidator.validator_type === 'role' ? editingValidator.role_name : null,
                    user_id: editingValidator.validator_type === 'user' ? editingValidator.user_id : null,
                    niveau_validation: editingValidator.niveau_validation!,
                  });
                  toast.success('Validateur ajouté');
                }
                setIsValidatorDialogOpen(false);
                setEditingValidator(null);
                setSelectedTier(null);
                await loadTiers();
              } catch (error: any) {
                toast.error(error.message || 'Erreur');
              }
            }}>
              <Save className="w-4 h-4 mr-2" />Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
