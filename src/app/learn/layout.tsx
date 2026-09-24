import { requireOnboarding } from "@/lib/onboarding";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireOnboarding();
  return children;
}
