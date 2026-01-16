import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  FileText, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2,
  Webhook,
  Settings as SettingsIcon,
  AlertTriangle,
} from "lucide-react";
import ComingSoon from "./ComingSoon";

export default function SettingsSystem() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Paramètres système</h2>
        <p className="text-muted-foreground mt-1">
          Configuration technique, maintenance et options avancées
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Sauvegardes</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Gestion des sauvegardes automatiques et manuelles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComingSoon title="Sauvegardes" subtitle="À venir" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Logs</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Consultation des logs système et d'activité
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComingSoon title="Logs" subtitle="À venir" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Intégrations</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configuration des intégrations externes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComingSoon title="Intégrations" subtitle="À venir" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Webhook className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">API / Webhooks</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Configuration de l'API et des webhooks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComingSoon title="API / Webhooks" subtitle="À venir" />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Import / Export</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Import et export de données
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComingSoon title="Import / Export" subtitle="À venir" />
          </CardContent>
        </Card>

        <Card className="border-border/50 border-destructive/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <CardTitle className="text-base text-destructive">Zone de danger</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Réinitialisations et suppressions irréversibles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-semibold mb-2">Réinitialisations</p>
              <p className="text-xs text-muted-foreground mb-3">
                Réinitialiser certaines données ou configurations
              </p>
              <Button variant="outline" size="sm" className="text-xs" disabled>
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Réinitialiser
              </Button>
            </div>
            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm font-semibold mb-2 text-destructive">Suppression du compte</p>
              <p className="text-xs text-muted-foreground mb-3">
                Cette action est irréversible et supprimera toutes les données
              </p>
              <Button variant="destructive" size="sm" className="text-xs" disabled>
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Supprimer le compte
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
