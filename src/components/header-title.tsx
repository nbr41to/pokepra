type Props = {
  title: string;
  description?: string;
};

export const HeaderTitle = ({ title, description }: Props) => {
  return (
    <div className="grid place-content-center p-2">
      <h1 className="text-xl">{title}</h1>
      {description && (
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground text-xs">
          {description}
        </p>
      )}
    </div>
  );
};
