export default function ProtectedLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return <div className="w-full h-[100vh]">{children}</div>;
  }