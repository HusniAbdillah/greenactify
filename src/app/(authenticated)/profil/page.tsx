import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ProfileContent from "./ProfileContent";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect('/'); // Redirect ke halaman utama jika belum login
  }

  const plainUser = {
    id: user.id,
    username: user.username,
    imageUrl: user.imageUrl,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  return <ProfileContent user1={plainUser} />;
}
