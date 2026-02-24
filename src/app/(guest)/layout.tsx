export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center">
      <header className="bg-background w-full border-b">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-6">
          <span className="text-lg font-semibold">Property Manager</span>
          <span className="bg-muted text-muted-foreground ml-2 rounded-md px-2 py-0.5 text-xs">
            Guest Access
          </span>
        </div>
      </header>
      <main className="w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
      <footer className="bg-background w-full border-t">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-center px-6">
          <p className="text-muted-foreground text-xs">
            Private Real Estate Manager
          </p>
        </div>
      </footer>
    </div>
  );
}
