type FoldBadgeProps = {
  visible: boolean;
};

export const FoldBadge = ({ visible }: FoldBadgeProps) => {
  if (!visible) return null;

  return (
    <div className="absolute right-4 bottom-3 rounded-full border bg-background/30 px-8 py-1 text-foreground/70">
      Fold
    </div>
  );
};
