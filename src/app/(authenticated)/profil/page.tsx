import { currentUser } from "@clerk/nextjs/server";
import ProfileContent from "./ProfileContent";

export default async function Page() {
  const user = await currentUser();
  const plainUser = user
    ? {
        id: user.id,
        username: user.username,
        imageUrl: user.imageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    : null;

  return <ProfileContent user1={plainUser} />;
}
