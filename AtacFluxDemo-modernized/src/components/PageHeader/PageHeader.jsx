export function PageHeader({ title, subtitle }) {
  return (
    <header className="flex flex-col items-center text-center py-6 animate-[fadeIn_0.35s_ease-out_both]">
      <h1 className="text-2xl font-light text-slate-200 mb-1">{title}</h1>
      <p className="text-[13px] text-slate-400 max-w-[700px] leading-relaxed">{subtitle}</p>
    </header>
  );
}
