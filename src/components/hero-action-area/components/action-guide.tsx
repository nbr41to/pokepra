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
    <div className="absolute top-2 right-3 z-20 flex flex-col items-end rounded-md text-teal-500 text-xs">
      {showDoubleTap && <div>{tapLabel}: ダブルタップ</div>}
      {showFold && <div>Fold: 上にスワイプ</div>}
    </div>
  );
};
