type ActionGuideProps = {
  visible: boolean;
  showFold: boolean;
  showDoubleTap: boolean;
  doubleTapActionName?: string;
};

export const ActionGuide = ({
  visible,
  showFold,
  showDoubleTap,
  doubleTapActionName,
}: ActionGuideProps) => {
  if (!visible || (!showFold && !showDoubleTap)) return null;

  const tapLabel = doubleTapActionName ?? "Action";

  return (
    <div className="absolute top-4 left-4 z-20 rounded-md border border-teal-400/70 bg-teal-200/20 px-3 py-2 text-teal-500 text-xs shadow-sm">
      {showFold && <div>Fold: カードを上にスワイプ</div>}
      {showDoubleTap && <div>{tapLabel}: カードをダブルタップ</div>}
    </div>
  );
};
