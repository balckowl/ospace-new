export function StarryBackdrop2() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-black" />
      <div className="starry-layer starry-layer-sm absolute inset-0" />
      <div className="starry-layer starry-layer-md absolute inset-0" />
      <div className="starry-layer starry-layer-lg absolute inset-0" />
    </div>
  );
}

export default StarryBackdrop2;
