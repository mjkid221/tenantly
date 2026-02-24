export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-muted/30">
      <header className="w-full border-b bg-background">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-6">
          <span className="text-lg font-semibold">Property Manager</span>
          <span className="ml-2 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Guest Access
          </span>
        </div>
      </header>
      <main className="w-full max-w-4xl flex-1 px-6 py-8">{children}</main>
      <footer className="w-full border-t bg-background">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-center px-6">
          <p className="text-xs text-muted-foreground">
            Private Real Estate Manager
          </p>
        </div>
      </footer>
    </div>
  );
}
