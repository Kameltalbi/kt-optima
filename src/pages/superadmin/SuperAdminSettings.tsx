import { useState, useEffect } from "react";
import { SuperAdminLayout } from "@/layouts/SuperAdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Package, Shield, Save, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
}

interface SystemLimits {
  maxUsersPerCompany: number;
  maxDocumentsPerMonth: number;
  maxStorageGB: number;
}

export default function SuperAdminSettings() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [limits, setLimits] = useState<SystemLimits>({
    maxUsersPerCompany: 50,
    maxDocumentsPerMonth: 10000,
    maxStorageGB: 100,
  });

  const [features, setFeatures] = useState({
    allowRegistration: true,
    maintenanceMode: false,
    emailNotifications: true,
    twoFactorAuth: false,
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .order("name");

      if (error) throw error;
      setModules((data || []) as Module[]);
    } catch (error) {
      console.error("Error loading modules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("modules")
        .update({ active, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setModules((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)));
      toast({
        title: active ? "Module activé" : "Module désactivé",
        description: `Le module a été ${active ? "activé" : "désactivé"} avec succès.`,
      });
    } catch (error) {
      console.error("Error toggling module:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du module",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    toast({
      title: "Paramètres sauvegardés",
      description: "Les paramètres globaux ont été mis à jour.",
    });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paramètres Globaux</h1>
            <p className="text-muted-foreground mt-1">
              Configuration générale de la plateforme
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>

        {/* Modules Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Modules Disponibles</CardTitle>
            </div>
            <CardDescription>
              Activer ou désactiver les modules disponibles sur la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : modules.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Aucun module configuré</p>
            ) : (
              <div className="space-y-4">
                {modules.map((module) => (
                  <div
                    key={module.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{module.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {module.code}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {module.description || "Aucune description"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={module.active}
                      onCheckedChange={(checked) => handleToggleModule(module.id, checked)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Toggles */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Fonctionnalités Globales</CardTitle>
            </div>
            <CardDescription>
              Activer ou désactiver des fonctionnalités pour toute la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autoriser les inscriptions</Label>
                <p className="text-sm text-muted-foreground">
                  Permettre aux nouvelles entreprises de s'inscrire
                </p>
              </div>
              <Switch
                checked={features.allowRegistration}
                onCheckedChange={(checked) =>
                  setFeatures((prev) => ({ ...prev, allowRegistration: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Label>Mode maintenance</Label>
                  {features.maintenanceMode && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Actif
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Bloquer l'accès à la plateforme pour maintenance
                </p>
              </div>
              <Switch
                checked={features.maintenanceMode}
                onCheckedChange={(checked) =>
                  setFeatures((prev) => ({ ...prev, maintenanceMode: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Envoyer des emails pour les événements importants
                </p>
              </div>
              <Switch
                checked={features.emailNotifications}
                onCheckedChange={(checked) =>
                  setFeatures((prev) => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Exiger 2FA pour tous les utilisateurs
                </p>
              </div>
              <Switch
                checked={features.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setFeatures((prev) => ({ ...prev, twoFactorAuth: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* System Limits */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Limites Système</CardTitle>
            </div>
            <CardDescription>
              Définir les limites par défaut pour les entreprises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="maxUsers">Utilisateurs max par entreprise</Label>
                <Input
                  id="maxUsers"
                  type="number"
                  value={limits.maxUsersPerCompany}
                  onChange={(e) =>
                    setLimits((prev) => ({
                      ...prev,
                      maxUsersPerCompany: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDocs">Documents max par mois</Label>
                <Input
                  id="maxDocs"
                  type="number"
                  value={limits.maxDocumentsPerMonth}
                  onChange={(e) =>
                    setLimits((prev) => ({
                      ...prev,
                      maxDocumentsPerMonth: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStorage">Stockage max (GB)</Label>
                <Input
                  id="maxStorage"
                  type="number"
                  value={limits.maxStorageGB}
                  onChange={(e) =>
                    setLimits((prev) => ({
                      ...prev,
                      maxStorageGB: parseInt(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
}
