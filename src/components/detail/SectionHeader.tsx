// כותרת של חלק במסך הפירוט: אייקון, כותרת וכותרת משנה.
import * as LucideIcons from 'lucide-react';

export default function SectionHeader({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  const Icon = (LucideIcons as any)[icon];
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-sea-600 shadow-sm">
          <Icon size={20} aria-hidden="true" />
        </div>
        <h3 className="font-black text-lg text-slate-900 tracking-tight">{title}</h3>
      </div>
      <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{subtitle}</span>
    </div>
  );
}
