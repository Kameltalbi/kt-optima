import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Percent, Calculator, Save, RefreshCw, Info } from 'lucide-react';
import { usePayroll } from '@/hooks/use-payroll';
import { toast } from 'sonner';

export default function SettingsPayroll() {
  const { 
    parametres, 
    tranches, 
    initDefaultParams, 
    updateParametre, 
    updateTranche,
    loadParametres,
    loadTranches
  } = usePayroll();

  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [editingTranche, setEditingTranche] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const [tempTranche, setTempTranche] = useState<{ min: string; max: string; taux: string }>({ min: '', max: '', taux: '' });
  const [initializing, setInitializing] = useState(false);

  // Initialiser les paramètres par défaut si vides
  const handleInitialize = async () => {
    setInitializing(true);
    await initDefaultParams();
    setInitializing(false);
    toast.success('Paramètres initialisés avec les valeurs par défaut');
  };

  const handleSaveParam = async (id: string) => {
    const value = parseFloat(tempValue);
    if (isNaN(value) || value < 0) {
      toast.error('Valeur invalide');
      return;
    }
    await updateParametre(id, value);
    setEditingParam(null);
    setTempValue('');
  };

  const handleSaveTranche = async (id: string) => {
    const min = parseFloat(tempTranche.min);
    const max = tempTranche.max ? parseFloat(tempTranche.max) : null;
    const taux = parseFloat(tempTranche.taux);
    
    if (isNaN(min) || isNaN(taux) || taux < 0 || taux > 100) {
      toast.error('Valeurs invalides');
      return;
    }
    
    await updateTranche(id, {
      tranche_min: min,
      tranche_max: max,
      taux
    });
    setEditingTranche(null);
    setTempTranche({ min: '', max: '', taux: '' });
  };

  const startEditParam = (id: string, value: number) => {
    setEditingParam(id);
    setTempValue(value.toString());
  };

  const startEditTranche = (id: string, min: number, max: number | null, taux: number) => {
    setEditingTranche(id);
    setTempTranche({
      min: min.toString(),
      max: max?.toString() || '',
      taux: taux.toString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Paramètres de Paie
          </h1>
          <p className="text-muted-foreground">
            Configuration des taux CNSS et barème IRPP tunisien
          </p>
        </div>
        
        {(parametres.length === 0 || tranches.length === 0) && (
          <Button onClick={handleInitialize} disabled={initializing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${initializing ? 'animate-spin' : ''}`} />
            Initialiser les paramètres
          </Button>
        )}
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les taux CNSS et le barème IRPP sont configurables pour s'adapter aux évolutions légales.
          Les calculs de paie utilisent ces paramètres pour générer des fiches de paie conformes.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Cotisations CNSS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Cotisations Sociales (CNSS)
            </CardTitle>
            <CardDescription>
              Taux de cotisations pour la sécurité sociale tunisienne
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parametres.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Aucun paramètre configuré. Cliquez sur "Initialiser" pour créer les valeurs par défaut.
              </p>
            ) : (
              <div className="space-y-4">
                {parametres.map((param) => (
                  <div key={param.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{param.libelle}</p>
                      <p className="text-sm text-muted-foreground">Code: {param.code}</p>
                    </div>
                    
                    {editingParam === param.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="w-24"
                        />
                        <span>%</span>
                        <Button size="sm" onClick={() => handleSaveParam(param.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingParam(null)}>
                          Annuler
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {param.valeur.toFixed(2)} %
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => startEditParam(param.id, param.valeur)}
                        >
                          Modifier
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Résumé des charges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Résumé des Charges
            </CardTitle>
            <CardDescription>
              Aperçu des cotisations pour un salaire de 1 000 TND
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parametres.length > 0 && (
              <div className="space-y-4">
                {(() => {
                  const salaire = 1000;
                  const tauxSalarie = parametres.find(p => p.code === 'CNSS_SALARIE')?.valeur || 9.18;
                  const tauxEmployeur = parametres.find(p => p.code === 'CNSS_EMPLOYEUR')?.valeur || 16.57;
                  const cnssSalarie = salaire * (tauxSalarie / 100);
                  const cnssEmployeur = salaire * (tauxEmployeur / 100);
                  
                  return (
                    <>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Salaire brut exemple</p>
                        <p className="text-2xl font-bold">{salaire.toFixed(2)} TND</p>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>CNSS Salarié ({tauxSalarie}%)</span>
                          <span className="font-medium text-destructive">-{cnssSalarie.toFixed(2)} TND</span>
                        </div>
                        <div className="flex justify-between">
                          <span>CNSS Employeur ({tauxEmployeur}%)</span>
                          <span className="font-medium text-muted-foreground">{cnssEmployeur.toFixed(2)} TND</span>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between font-bold">
                        <span>Coût total employeur</span>
                        <span>{(salaire + cnssEmployeur).toFixed(2)} TND</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Barème IRPP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Barème IRPP Tunisien (Annuel)
          </CardTitle>
          <CardDescription>
            Impôt sur le Revenu des Personnes Physiques - Calcul progressif par tranches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tranches.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune tranche configurée. Cliquez sur "Initialiser" pour créer le barème par défaut.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ordre</TableHead>
                  <TableHead>Tranche Minimum (TND)</TableHead>
                  <TableHead>Tranche Maximum (TND)</TableHead>
                  <TableHead>Taux (%)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tranches.map((tranche) => (
                  <TableRow key={tranche.id}>
                    <TableCell>
                      <Badge variant="outline">{tranche.ordre}</Badge>
                    </TableCell>
                    
                    {editingTranche === tranche.id ? (
                      <>
                        <TableCell>
                          <Input
                            type="number"
                            value={tempTranche.min}
                            onChange={(e) => setTempTranche(prev => ({ ...prev, min: e.target.value }))}
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={tempTranche.max}
                            onChange={(e) => setTempTranche(prev => ({ ...prev, max: e.target.value }))}
                            className="w-32"
                            placeholder="Illimité"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            value={tempTranche.taux}
                            onChange={(e) => setTempTranche(prev => ({ ...prev, taux: e.target.value }))}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => handleSaveTranche(tranche.id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingTranche(null)}>
                              Annuler
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{tranche.tranche_min.toLocaleString()} TND</TableCell>
                        <TableCell>
                          {tranche.tranche_max ? `${tranche.tranche_max.toLocaleString()} TND` : (
                            <Badge variant="secondary">Illimité</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={tranche.taux === 0 ? 'outline' : 'default'}
                            className={tranche.taux >= 30 ? 'bg-destructive' : ''}
                          >
                            {tranche.taux}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => startEditTranche(
                              tranche.id, 
                              tranche.tranche_min, 
                              tranche.tranche_max, 
                              tranche.taux
                            )}
                          >
                            Modifier
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Exemple de calcul IRPP */}
      {tranches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exemple de Calcul IRPP</CardTitle>
            <CardDescription>
              Pour un revenu annuel imposable de 25 000 TND
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(() => {
                const revenu = 25000;
                let irppTotal = 0;
                const details: { tranche: string; montant: number; taux: number; impot: number }[] = [];
                
                for (const tranche of tranches) {
                  const min = tranche.tranche_min;
                  const max = tranche.tranche_max ?? Infinity;
                  
                  if (revenu > min) {
                    const plafond = Math.min(revenu, max);
                    const montantTranche = plafond - min;
                    const impotTranche = montantTranche * (tranche.taux / 100);
                    irppTotal += impotTranche;
                    
                    if (montantTranche > 0) {
                      details.push({
                        tranche: max === Infinity ? `> ${min.toLocaleString()}` : `${min.toLocaleString()} - ${max.toLocaleString()}`,
                        montant: montantTranche,
                        taux: tranche.taux,
                        impot: impotTranche
                      });
                    }
                  }
                }
                
                return (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tranche</TableHead>
                          <TableHead>Montant imposé</TableHead>
                          <TableHead>Taux</TableHead>
                          <TableHead className="text-right">Impôt</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.map((d, i) => (
                          <TableRow key={i}>
                            <TableCell>{d.tranche} TND</TableCell>
                            <TableCell>{d.montant.toLocaleString()} TND</TableCell>
                            <TableCell>{d.taux}%</TableCell>
                            <TableCell className="text-right">{d.impot.toFixed(2)} TND</TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted">
                          <TableCell colSpan={3}>IRPP Annuel Total</TableCell>
                          <TableCell className="text-right">{irppTotal.toFixed(2)} TND</TableCell>
                        </TableRow>
                        <TableRow className="font-bold">
                          <TableCell colSpan={3}>IRPP Mensuel (÷12)</TableCell>
                          <TableCell className="text-right">{(irppTotal / 12).toFixed(2)} TND</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
