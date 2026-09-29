import { BarChart3, BookOpen, Calculator, ChevronRight, ClipboardList, FlaskConical, LayoutDashboard, Menu, Network, PanelLeftClose, Target, X } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useBatches } from "@/components/batch-context";
import { formatNumber, getDatasetStats } from "@/lib/stats";

const navItems = [
  { href: "/", label: "Project overview", icon: LayoutDashboard, section: "START HERE" },
  { href: "/dataset", label: "Manufacturing dataset", icon: ClipboardList, section: "INVESTIGATE" },
  { href: "/defect-rate", label: "Defect rate", icon: BarChart3, section: "INVESTIGATE" },
  { href: "/binomial-calculator", label: "Binomial calculator", icon: Calculator, section: "PROBABILITY LAB" },
  { href: "/simulation", label: "Simulation", icon: FlaskConical, section: "PROBABILITY LAB" },
  { href: "/batch-probability", label: "Batch probability", icon: Target, section: "PROBABILITY LAB" },
  { href: "/results", label: "Results", icon: Network, section: "WRAP-UP" },
  { href: "/conclusion", label: "Conclusion", icon: BookOpen, section: "WRAP-UP" },
];

export function QualityShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { batches } = useBatches();
  const { totalInspected } = getDatasetStats(batches);
  const grouped = navItems.reduce<Record<string, typeof navItems>>((acc, item) => {
    (acc[item.section] ||= []).push(item);
    return acc;
  }, {});
  return (
    <div className="lab-app texture">
      <aside className={`lab-sidebar fixed inset-y-0 left-0 z-40 flex w-[278px] flex-col border-r border-sidebar-border transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-start justify-between px-6 pb-6 pt-7">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground"><span className="lab-mono text-sm font-bold">Q/</span></span>
            <span><span className="block font-bold tracking-tight">Quality Lab</span><span className="lab-mono mt-0.5 block text-[10px] text-sidebar-foreground/50">BTECH · STATISTICS</span></span>
          </Link>
          <button type="button" className="rounded-md p-1 text-sidebar-foreground/60 hover:bg-sidebar-accent md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={18} /></button>
        </div>
        <div className="mx-6 mb-7 rounded-xl border border-sidebar-border bg-sidebar-accent/50 px-4 py-3">
          <div className="flex items-center gap-2 text-[11px] text-sidebar-foreground/55"><span className="status-dot" /> OBSERVATION SET 01</div>
          <div className="mt-2 text-sm font-semibold text-sidebar-foreground">Manufacturing variation</div>
           <div className="lab-mono mt-1 text-[10px] text-sidebar-foreground/45">{batches.length} BATCHES · {formatNumber(totalInspected)} UNITS</div>
        </div>
        <nav className="mobile-nav-scroll flex-1 space-y-6 overflow-y-auto px-4 pb-5">
          {Object.entries(grouped).map(([section, items]) => (
            <div key={section}>
              <div className="mb-2 px-3 font-mono text-[9px] font-medium tracking-[.18em] text-sidebar-foreground/35">{section}</div>
              <div className="space-y-1">
                {items.map((item) => {
                  const active = location === item.href;
                  const Icon = item.icon;
                  return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`nav-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[12px] font-semibold ${active ? "nav-link-active" : ""}`} data-testid={`link-nav-${item.href === "/" ? "overview" : item.href.slice(1)}`}><Icon size={16} strokeWidth={active ? 2.3 : 1.8} /><span>{item.label}</span>{active && <ChevronRight className="ml-auto" size={14} />}</Link>;
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="border-t border-sidebar-border px-6 py-5">
          <div className="lab-mono text-[10px] text-sidebar-foreground/40">PROJECT STATUS</div>
           <div className="mt-2 flex items-center gap-2 text-xs text-sidebar-foreground/75"><span className="status-dot" /> Dataset editable locally</div>
        </div>
      </aside>
      {mobileOpen && <button type="button" className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation overlay" data-testid="button-navigation-overlay" />}
      <main className="min-h-[100dvh] md:pl-[278px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border bg-background/85 px-5 backdrop-blur-md md:px-10">
          <button type="button" className="rounded-lg border border-border bg-card p-2 text-foreground md:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={19} /></button>
          <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex"><span className="lab-mono text-[10px] text-primary">NOTEBOOK /</span><span>Variation to defect risk</span></div>
          <div className="ml-auto flex items-center gap-3"><span className="hidden text-right sm:block"><span className="block text-[11px] font-semibold">Student project review</span><span className="lab-mono block text-[10px] text-muted-foreground">LOCAL ANALYSIS MODE</span></span><span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">SP</span></div>
        </header>
        {children}
      </main>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: ReactNode; description: string; action?: ReactNode }) {
  return <div className="mb-9 flex flex-col gap-5 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between"><div><div className="eyebrow mb-3">{eyebrow}</div><h1 className="lab-display max-w-3xl text-4xl font-semibold leading-[.98] text-foreground sm:text-5xl">{title}</h1><p className="mt-4 max-w-2xl text-[14px] leading-7 text-muted-foreground">{description}</p></div>{action}</div>;
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <div className="rule-label mb-4">{children}</div>;
}
