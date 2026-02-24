import { api } from "~/trpc/server";
import { DashboardHome } from "./_components/dashboard-home";

export const metadata = {
  title: "Dashboard - Property Manager",
};

export default async function DashboardPage() {
  const user = await api.user.me();
  return <DashboardHome role={user.role} userName={user.fullName} />;
}
