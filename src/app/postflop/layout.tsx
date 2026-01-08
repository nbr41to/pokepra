export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-dvh flex-col justify-between">
      <h1 className="text-center">Postflop</h1>
      {children}
    </div>
  );
}
