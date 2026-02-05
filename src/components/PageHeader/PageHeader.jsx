export function PageHeader({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center text-center animate-[pageHeaderFadeIn_0.35s_ease-out_both]">
      <h1 className="text-2xl font-light m-0 mb-1 text-slate-200">{title}</h1>
      <p className="text-[13px] text-slate-400 m-0 max-w-[700px] leading-relaxed">{subtitle}</p>
    </div>
  );
}
