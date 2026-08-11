import {
  NotebookPen, Wand2, Target, Ticket, MessageSquareText, Calculator, BarChart3,
  ListChecks, FileText, Shuffle, Users, Cake, ArrowDownAZ, CalendarCheck,
  HeartHandshake, ClipboardList, ListTree, Award, Mail, Tags, QrCode, Type,
  CalendarClock, SquareCheckBig, StickyNote, Sparkles, LayoutGrid, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  NotebookPen, Wand2, Target, Ticket, MessageSquareText, Calculator, BarChart3,
  ListChecks, FileText, Shuffle, Users, Cake, ArrowDownAZ, CalendarCheck,
  HeartHandshake, ClipboardList, ListTree, Award, Mail, Tags, QrCode, Type,
  CalendarClock, SquareCheckBig, StickyNote, Sparkles, LayoutGrid,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = MAP[name] ?? LayoutGrid;
  return <C className={className} aria-hidden />;
}
