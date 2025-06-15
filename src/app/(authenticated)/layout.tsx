
import AppShell from "@/components/layout/app-shell";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ProHub Dashboard',
  description: 'Manage your productivity with ProHub.',
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
