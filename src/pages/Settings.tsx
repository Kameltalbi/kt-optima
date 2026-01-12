import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Shield, FileText, Globe, FolderOpen, Upload, Download, Trash2 } from "lucide-react";

export default function Settings() {
  return (
    <MainLayout title="Paramètres" subtitle="Configuration de l'entreprise et du système">
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="company" className="gap-2 text-xs">
            <Building2 className="w-3.5 h-3.5" />
            Entreprise
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 text-xs">
            <Users className="w-3.5 h-3.5" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2 text-xs">
            <Shield className="w-3.5 h-3.5" />
            Rôles
          </TabsTrigger>
          <TabsTrigger value="invoicing" className="gap-2 text-xs">
            <FileText className="w-3.5 h-3.5" />
            Facturation
          </TabsTrigger>
          <TabsTrigger value="regional" className="gap-2 text-xs">
            <Globe className="w-3.5 h-3.5" />
            Régional
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2 text-xs">
            <FolderOpen className="w-3.5 h-3.5" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Informations de l'entreprise</CardTitle>
              <CardDescription className="text-xs">
                Ces informations apparaîtront sur vos documents officiels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Nom de l'entreprise</Label>
                  <Input placeholder="Entreprise SA" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Numéro fiscal</Label>
                  <Input placeholder="123456789" className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Adresse</Label>
                <Input placeholder="123 Rue Principale, Casablanca" className="h-9 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Téléphone</Label>
                  <Input placeholder="+212 5XX XXX XXX" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Email</Label>
                  <Input placeholder="contact@entreprise.ma" className="h-9 text-sm" />
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="text-xs">
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Logo de l'entreprise</CardTitle>
              <CardDescription className="text-xs">
                Le logo sera affiché sur les factures et documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                  <Building2 className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Télécharger un logo
                  </Button>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG jusqu'à 2MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Utilisateurs</CardTitle>
                  <CardDescription className="text-xs">
                    Gérez les accès à votre espace ERP
                  </CardDescription>
                </div>
                <Button size="sm" className="text-xs">
                  Ajouter un utilisateur
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Admin Principal", email: "admin@entreprise.ma", role: "Administrateur" },
                  { name: "Mohamed Alami", email: "m.alami@entreprise.ma", role: "Comptable" },
                  { name: "Fatima Bennani", email: "f.bennani@entreprise.ma", role: "Commercial" },
                ].map((user) => (
                  <div
                    key={user.email}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary-foreground">
                      {user.role}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Rôles et permissions</CardTitle>
                  <CardDescription className="text-xs">
                    Définissez les droits d'accès par rôle
                  </CardDescription>
                </div>
                <Button size="sm" className="text-xs">
                  Créer un rôle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Administrateur", permissions: "Accès complet", users: 1 },
                  { name: "Comptable", permissions: "Finances, Facturation, Rapports", users: 1 },
                  { name: "Commercial", permissions: "Clients, Produits, Facturation", users: 1 },
                ].map((role) => (
                  <div
                    key={role.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div>
                      <p className="text-sm font-medium">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.permissions}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {role.users} utilisateur{role.users > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoicing" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Numérotation des documents</CardTitle>
              <CardDescription className="text-xs">
                Configurez les préfixes et formats de numérotation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Préfixe factures</Label>
                  <Input placeholder="FAC-" defaultValue="FAC-" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Prochain numéro</Label>
                  <Input placeholder="001" defaultValue="001" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Préfixe devis</Label>
                  <Input placeholder="DEV-" defaultValue="DEV-" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Prochain numéro</Label>
                  <Input placeholder="001" defaultValue="001" className="h-9 text-sm" />
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="text-xs">
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">TVA</CardTitle>
              <CardDescription className="text-xs">
                Configurez les taux de TVA applicables
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Taux normal", rate: "20%" },
                { label: "Taux réduit", rate: "10%" },
                { label: "Taux super-réduit", rate: "7%" },
              ].map((tax) => (
                <div
                  key={tax.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <span className="text-sm">{tax.label}</span>
                  <span className="text-sm font-medium">{tax.rate}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Paramètres régionaux</CardTitle>
              <CardDescription className="text-xs">
                Devise, langue et formats d'affichage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Devise</Label>
                  <Input placeholder="MAD" defaultValue="MAD" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Symbole</Label>
                  <Input placeholder="DH" defaultValue="DH" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Langue</Label>
                  <Input placeholder="Français" defaultValue="Français" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Format de date</Label>
                  <Input placeholder="DD/MM/YYYY" defaultValue="DD/MM/YYYY" className="h-9 text-sm" />
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="text-xs">
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Gestion des documents</CardTitle>
                  <CardDescription className="text-xs">
                    Factures, contrats, justificatifs et documents RH
                  </CardDescription>
                </div>
                <Button size="sm" className="text-xs gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Télécharger
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Facture_001.pdf", type: "Facture", date: "12/01/2025", size: "245 KB" },
                  { name: "Contrat_Client_ABC.pdf", type: "Contrat", date: "10/01/2025", size: "1.2 MB" },
                  { name: "Justificatif_Deplacement.pdf", type: "Justificatif", date: "08/01/2025", size: "156 KB" },
                  { name: "Fiche_Paie_Dec2024.pdf", type: "RH", date: "05/01/2025", size: "89 KB" },
                ].map((doc) => (
                  <div
                    key={doc.name}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} • {doc.date} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Catégories de documents</CardTitle>
              <CardDescription className="text-xs">
                Organisez vos documents par catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Factures", count: 24 },
                  { name: "Contrats", count: 8 },
                  { name: "Justificatifs", count: 45 },
                  { name: "Documents RH", count: 12 },
                ].map((cat) => (
                  <div
                    key={cat.name}
                    className="p-3 rounded-lg bg-muted/30 border border-border/50"
                  >
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{cat.count} fichiers</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}