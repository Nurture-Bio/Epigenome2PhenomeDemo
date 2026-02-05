export function PageHeader({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center animate-[pageHeaderFadeIn_0.35s_ease-out_both]">
      <h1 className="type-heading mb-1">{title}</h1>
      <p className="type-body text-slate-400 max-w-[700px] leading-relaxed">{subtitle}</p>
    </div>
  );
}
