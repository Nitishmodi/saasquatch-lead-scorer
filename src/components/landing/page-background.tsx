export function PageBackground() {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[720px] overflow-hidden">
      <div className="aurora -top-40 left-[8%] size-[480px] bg-emerald-300/35" />
      <div className="aurora top-10 right-[6%] size-[420px] bg-sky-300/30 [animation-delay:-6s]" />
      <div className="aurora top-64 left-[38%] size-[360px] bg-teal-200/40 [animation-delay:-12s]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(148_163_184/0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgb(148_163_184/0.14)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-slate-50" />
    </div>
  );
}
