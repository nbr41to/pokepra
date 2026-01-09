type Props = {
  title: string;
};

export const HeaderTitle = ({ title }: Props) => {
  return (
    <div className="grid place-content-center p-2">
      <h1 className="text-xl">{title}</h1>
    </div>
  );
};
