import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: 'facture' | 'devis' | 'bon-livraison' | 'avoir';
  documentNumber: string;
  clientEmail?: string;
  clientName?: string;
  onSend?: (email: string, subject: string, message: string) => Promise<void>;
}

export function SendEmailModal({
  open,
  onOpenChange,
  documentType,
  documentNumber,
  clientEmail,
  clientName,
  onSend,
}: SendEmailModalProps) {
  const [email, setEmail] = useState(clientEmail || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const documentLabels = {
    'facture': 'Facture',
    'devis': 'Devis',
    'bon-livraison': 'Bon de livraison',
    'avoir': 'Avoir',
  };

  const defaultSubject = `${documentLabels[documentType]} ${documentNumber}`;
  const defaultMessage = `Bonjour${clientName ? ` ${clientName}` : ''},\n\nVeuillez trouver ci-joint le ${documentLabels[documentType].toLowerCase()} ${documentNumber}.\n\nCordialement`;

  // Initialiser les valeurs par défaut
  useState(() => {
    if (open) {
      setSubject(defaultSubject);
      setMessage(defaultMessage);
      if (clientEmail) {
        setEmail(clientEmail);
      }
    }
  });

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Veuillez saisir une adresse email valide');
      return;
    }

    if (!subject.trim()) {
      toast.error('Veuillez saisir un objet');
      return;
    }

    try {
      setSending(true);
      
      if (onSend) {
        await onSend(email, subject, message);
      } else {
        // Simulation d'envoi (à remplacer par un vrai service d'email)
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Email envoyé à ${email}`);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Erreur lors de l\'envoi de l\'email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Envoyer par email</DialogTitle>
          <DialogDescription>
            Envoyer le {documentLabels[documentType].toLowerCase()} {documentNumber} par email
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Destinataire *</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Objet *</Label>
            <Input
              id="subject"
              placeholder="Objet de l'email"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Message personnalisé"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              disabled={sending}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Note: Le document PDF sera joint automatiquement à l'email.</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={sending}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !email || !subject.trim()}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Envoyer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
