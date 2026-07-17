import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdminStatusBanner } from "@/app/admin/AdminStatusBanner";

interface AdminShellProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export function AdminShell({
  title,
  description,
  backHref = "/admin",
  backLabel = "← Volver al admin",
  children,
}: AdminShellProps) {
  return (
  <>
      <PageHeader title={title} description={description} />
      <AdminStatusBanner />
      {backHref ? (
        <Link
          href={backHref}
          className="mb-6 inline-block text-sm font-medium text-sage-strong underline-offset-2 hover:underline"
        >
          {backLabel}
        </Link>
      ) : null}
      {children}
    </>
  );
}
