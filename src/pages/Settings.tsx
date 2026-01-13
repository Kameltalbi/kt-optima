import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Users, 
  Shield, 
  FileText, 
  Globe, 
  FolderOpen,
  Plus,
  Download,
  Trash2,
  Upload,
  FileCheck,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

const settingsSections = [
  { id: "company", label: "Entreprise", icon: Building2 },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "roles", label: "Rôles", icon: Shield },
  { id: "invoicing", label: "Facturation", icon: FileText },
  { id: "templates", label: "Modèles", icon: FileCheck },
  { id: "regional", label: "Régional", icon: Globe },
  { id: "documents", label: "Documents", icon: FolderOpen },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState("company");

  const renderContent = () => {
    switch (activeSection) {
      case "company":
        return (
          <div className="space-y-6">
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

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Pied de page documents</CardTitle>
                <CardDescription className="text-xs">
                  Texte affiché en bas de vos factures, devis et documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Contenu du pied de page</Label>
                  <textarea 
                    className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    placeholder="Capital: 100 000 DH | RC: 123456 | IF: 12345678 | ICE: 001234567890123 | Patente: 12345678 | CNSS: 1234567&#10;RIB: XXX XXX XXXX XXXX XXXX XXXX XXX&#10;Conditions de paiement, mentions légales..."
                  />
                </div>
                <div className="pt-2">
                  <Button size="sm" className="text-xs">
                    Enregistrer le pied de page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "users":
        return (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Utilisateurs</CardTitle>
                  <CardDescription className="text-xs">
                    Gérez les utilisateurs de votre organisation
                  </CardDescription>
                </div>
                <Button size="sm" className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Admin Principal", email: "admin@entreprise.ma", role: "Administrateur" },
                  { name: "Comptable", email: "compta@entreprise.ma", role: "Comptabilité" },
                  { name: "Commercial", email: "commercial@entreprise.ma", role: "Ventes" },
                ].map((user) => (
                  <div key={user.email} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-primary">{user.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{user.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "roles":
        return (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Rôles et permissions</CardTitle>
                  <CardDescription className="text-xs">
                    Configurez les accès par rôle
                  </CardDescription>
                </div>
                <Button size="sm" className="text-xs gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Nouveau rôle
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Administrateur", desc: "Accès complet", users: 1 },
                  { name: "Comptabilité", desc: "Finance et rapports", users: 2 },
                  { name: "Ventes", desc: "Commercial et clients", users: 3 },
                ].map((role) => (
                  <div key={role.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="text-sm font-medium">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">{role.users} utilisateurs</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case "invoicing":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Numérotation des documents</CardTitle>
                <CardDescription className="text-xs">
                  Format de numérotation automatique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Préfixe factures</Label>
                    <Input defaultValue="FAC-" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Prochain numéro</Label>
                    <Input defaultValue="00001" className="h-9 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Préfixe devis</Label>
                    <Input defaultValue="DEV-" className="h-9 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Prochain numéro</Label>
                    <Input defaultValue="00001" className="h-9 text-sm" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Taux de TVA</CardTitle>
                <CardDescription className="text-xs">
                  Taux applicables aux produits et services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "TVA Standard", rate: "20%" },
                    { name: "TVA Réduit", rate: "10%" },
                    { name: "TVA Super réduit", rate: "7%" },
                  ].map((vat) => (
                    <div key={vat.name} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <span className="text-sm">{vat.name}</span>
                      <Badge variant="secondary" className="text-[10px]">{vat.rate}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "regional":
        return (
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Paramètres régionaux</CardTitle>
              <CardDescription className="text-xs">
                Devise, langue et format de date
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Devise</Label>
                  <Input defaultValue="MAD" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Symbole</Label>
                  <Input defaultValue="DH" className="h-9 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Langue</Label>
                  <Input defaultValue="Français" className="h-9 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Format de date</Label>
                  <Input defaultValue="DD/MM/YYYY" className="h-9 text-sm" />
                </div>
              </div>
              <div className="pt-2">
                <Button size="sm" className="text-xs">
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case "templates":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Modèle de document actif</CardTitle>
                <CardDescription className="text-xs">
                  Ce modèle sera utilisé pour toutes les factures, devis et bons de commande
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border-2 border-primary">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Modèle Standard</p>
                      <p className="text-xs text-muted-foreground">Design professionnel avec en-tête et pied de page</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Actif</Badge>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs gap-1.5"
                      onClick={() => window.open('/documents/preview', '_blank')}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Aperçu
                    </Button>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-3">Autres modèles disponibles</p>
                  <div className="space-y-2">
                    {[
                      { id: 2, name: "Modèle Minimaliste", desc: "Design épuré et moderne" },
                      { id: 3, name: "Modèle Coloré", desc: "Avec couleurs personnalisées" },
                    ].map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.desc}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-xs">
                          Activer
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Personnalisation du modèle</CardTitle>
                <CardDescription className="text-xs">
                  Ajustez l'apparence de vos documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input defaultValue="#22C55E" className="h-9 text-sm flex-1" />
                      <div className="w-9 h-9 rounded-md bg-primary border" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Police du document</Label>
                    <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Open Sans</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Afficher le logo</Label>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Afficher le logo de l'entreprise en haut des documents</span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button size="sm" className="text-xs">
                    Enregistrer les préférences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "documents":
        return (
          <div className="space-y-6">
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Documents</CardTitle>
                    <CardDescription className="text-xs">
                      Gérez vos fichiers et modèles
                    </CardDescription>
                  </div>
                  <Button size="sm" className="text-xs gap-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    Téléverser
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { name: "Modèle facture.docx", type: "Modèle", date: "12/01/2024", size: "45 KB" },
                    { name: "Logo HD.png", type: "Image", date: "10/01/2024", size: "1.2 MB" },
                    { name: "CGV.pdf", type: "Document", date: "05/01/2024", size: "320 KB" },
                  ].map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • {doc.date} • {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
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
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["Factures", "Devis", "Contrats", "Modèles", "Autres"].map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                  ))}
                  <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1">
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout title="Paramètres" subtitle="Configuration de l'application">
      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>

        {/* Right Sidebar - Always Open */}
        <div className="w-56 flex-shrink-0">
          <Card className="border-border/50 sticky top-6 bg-[#1e293b]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-white">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-auto">
                <nav className="px-3 pb-3 space-y-1">
                  {settingsSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all duration-150 text-left",
                          isActive
                            ? "bg-primary/20 text-primary font-medium"
                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        )}
                      >
                        <Icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary")} />
                        <span>{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
