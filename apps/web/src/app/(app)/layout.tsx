import { TopNav } from "@/components/nav/top-nav";
import { ResponsiveSidebar } from "@/components/nav/responsive-sidebar";
import { requireUser } from "@/lib/auth/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav user={user} />
      <div className="flex">
        <ResponsiveSidebar />
        <main className="flex-1 px-4 py-6 md:px-8 max-w-3xl mx-auto pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
