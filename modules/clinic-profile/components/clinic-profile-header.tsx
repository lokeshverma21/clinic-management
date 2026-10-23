import { DashboardPageHeader } from "@/components/dashboard/dashboard-page-header"

interface ClinicProfileHeaderProps {
  title: string;
  subtitle: string;
}

export function ClinicProfileHeader({ title, subtitle }: ClinicProfileHeaderProps) {
  return (
    <DashboardPageHeader
      title={title}
      description={subtitle}
    />
  )
}
