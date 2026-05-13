import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { InboxApp } from "@/components/InboxApp";
import { isMockMode, MOCK_USER } from "@/lib/gmail-mock";

export default async function Home() {
  if (isMockMode()) {
    return <InboxApp userName={MOCK_USER.name} userEmail={MOCK_USER.email} />;
  }
  const session = await auth();
  if (!session || session.error === "RefreshAccessTokenError") {
    redirect("/sign-in");
  }
  return (
    <InboxApp
      userName={session.user?.name ?? session.user?.email ?? "You"}
      userEmail={session.user?.email ?? ""}
    />
  );
}
