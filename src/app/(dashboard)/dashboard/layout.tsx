import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TimezoneCookie from "@/components/TimezoneCookie";
import MusicPlayer from "@/components/fun/MusicPlayer";
import StickerToast from "@/components/fun/StickerToast";
import GlobalSounds from "@/components/fun/GlobalSounds";
import MusicInvite from "@/components/fun/MusicInvite";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, title: true, message: true, read: true },
  });

  return (
    <div className="flex min-h-screen bg-kid">
      <TimezoneCookie />
      <DashboardSidebar role={session.user.role ?? "STUDENT"} />
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader user={session.user} notifications={notifications} />
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6 lg:pb-6">{children}</main>
        {session.user.role === "STUDENT" && (
          <>
            <MusicPlayer />
            <StickerToast />
            <GlobalSounds />
            <MusicInvite />
          </>
        )}
      </div>
    </div>
  );
}
