import { ArrowBigUpDash } from "lucide-react";

type SwipeGuideProps = {
  visible: boolean;
};

export const SwipeGuide = ({ visible }: SwipeGuideProps) => {
  if (!visible) return null;

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-1/2 w-1/2 animate-pulse rounded-md border-2 border-teal-400/70 border-dashed bg-teal-200/20">
      <ArrowBigUpDash
        size={40}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-60 text-teal-500"
      />
      <span className="absolute bottom-1 left-2 font-montserrat text-sm text-teal-500">
        Swipe start
      </span>
    </div>
  );
};
