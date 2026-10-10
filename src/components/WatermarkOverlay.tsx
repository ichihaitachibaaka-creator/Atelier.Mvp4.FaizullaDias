interface WatermarkOverlayProps {
  visible: boolean;
}

export default function WatermarkOverlay({ visible }: WatermarkOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(120,80,60,0.3) 20px, rgba(120,80,60,0.3) 21px),
            repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(120,80,60,0.3) 20px, rgba(120,80,60,0.3) 21px)
          `,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="text-clay-dark/30 font-display text-3xl font-bold tracking-widest uppercase select-none"
          style={{ transform: 'rotate(-30deg)' }}
        >
          DEMO VERSION
        </div>
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="text-clay-dark/25 font-display text-sm font-semibold tracking-wider uppercase select-none">
          PREVIEW
        </div>
      </div>
      <div className="absolute top-4 right-4">
        <div className="text-clay-dark/25 font-display text-sm font-semibold tracking-wider uppercase select-none">
          PREVIEW
        </div>
      </div>
    </div>
  );
}
