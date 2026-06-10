import { auth } from "@/lib/auth";
import { HomeClient } from "@/components/home/HomeClient";

export default async function HomePage() {
  const session = await auth();
  return <HomeClient session={session} />;
}
