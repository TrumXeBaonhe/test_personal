import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { FloatingActionButton } from "@/components/fab";
import { PageTransition } from "@/components/page-transition";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)]">
        <Sidebar />
        <main className="relative py-6 lg:py-8 lg:px-8 px-4 w-full h-full overflow-hidden">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <FloatingActionButton />
      </div>
    </div>
  );
}
