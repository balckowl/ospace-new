export function StarryBackdrop() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(79,70,229,0.22),transparent_60%),radial-gradient(circle_at_75%_25%,rgba(14,116,144,0.18),transparent_62%),radial-gradient(circle_at_42%_88%,rgba(59,130,246,0.14),transparent_68%)]" />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-indigo-900/25 to-black/90" />
      <div className="starry-layer starry-layer-sm absolute inset-0" />
      <div className="starry-layer starry-layer-md absolute inset-0" />
      <div className="starry-layer starry-layer-lg absolute inset-0" />
    </div>
  );
}
