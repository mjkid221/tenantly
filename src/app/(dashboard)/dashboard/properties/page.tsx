import { PropertyList } from "./_components/property-list";

export const metadata = { title: "Properties - Property Manager" };

export default function PropertiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your properties</p>
        </div>
      </div>
      <PropertyList />
    </div>
  );
}
