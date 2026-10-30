import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import StickerAlbum from "@/components/fun/StickerAlbum";

export const dynamic = "force-dynamic";

export default async function StickersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link href="/dashboard/fun" className="text-sm font-bold text-brand-700 hover:underline">← Fun Zone</Link>
      <h1 className="text-3xl font-bold text-gray-900">⭐ My Sticker Album</h1>
      <StickerAlbum />
    </div>
  );
}
