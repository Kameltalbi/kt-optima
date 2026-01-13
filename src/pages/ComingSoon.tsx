import { Construction } from "lucide-react";

interface ComingSoonProps {
  title: string;
  subtitle?: string;
}

export default function ComingSoon({ title, subtitle }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="p-6 rounded-full bg-sand/20 mb-6">
        <Construction className="w-16 h-16 text-sand" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Module en développement</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Ce module sera bientôt disponible. Nous travaillons à enrichir BilvoxaERP
        avec de nouvelles fonctionnalités.
      </p>
    </div>
  );
}
