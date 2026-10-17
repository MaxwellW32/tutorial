import { SendTestEmail } from "@/components/demos/send-test-email";
import { SessionStatus } from "@/components/demos/session-status";
import { getSessionUser } from "@/lib/session";

/** Shows the test-email button to signed-in users and a sign-in prompt to everyone else. Reads the session: use inside Suspense. */
export async function SendTestEmailGate() {
  const user = await getSessionUser();
  return <SessionStatus>{user ? <SendTestEmail email={user.email} /> : null}</SessionStatus>;
}
