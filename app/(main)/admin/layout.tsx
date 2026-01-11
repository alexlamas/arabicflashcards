import { Metadata } from "next";
import { AdminWrapper } from "../../components/admin/AdminWrapper";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminWrapper>{children}</AdminWrapper>;
}
