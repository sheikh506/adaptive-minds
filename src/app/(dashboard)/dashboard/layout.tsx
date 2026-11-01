import { auth, signOut } from "@/auth";
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

  // Fetch full user details to check verified parental consent
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, consentGiven: true, name: true, email: true },
  });

  if (!dbUser) redirect("/login");

  // If student is missing parental consent, block access to all learning and practice dashboards
  if (dbUser.role === "STUDENT" && !dbUser.consentGiven) {
    const handleSignOut = async () => {
      "use server";
      await signOut({ redirectTo: "/login" });
    };

    return (
      <div className="flex min-h-screen items-center justify-center bg-yellow-50 p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border-4 border-amber-400 p-8 text-center shadow-md">
          <span className="text-6xl block mb-4">🦊</span>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Grown-Up Approval Needed!</h1>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Hi {dbUser.name || "there"}! Before you can play games and start learning, your parent or guardian needs to grant approval first.
          </p>
          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 text-xs text-amber-900 text-left mb-6 leading-relaxed">
            <p className="font-bold mb-1">How to activate your account:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Ask your parent or guardian to log into their parent account.</li>
              <li>Go to the <strong>My Children</strong> dashboard.</li>
              <li>Add or link your profile using your email: <strong className="break-all">{dbUser.email || "this email"}</strong>.</li>
              <li>Click <strong>Grant Consent</strong> to activate your learning journey!</li>
            </ol>
          </div>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 shadow-sm transition-colors text-sm"
            >
              Sign Out & Ask Grown-Up
            </button>
          </form>
        </div>
      </div>
    );
  }

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
