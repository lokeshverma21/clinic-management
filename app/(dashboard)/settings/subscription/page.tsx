import { SubscriptionPage } from "@/modules/subscriptions/components/subscription-page";

export const metadata = {
  title: "Subscription Settings | ClinicOS",
  description: "Manage your ClinicOS subscription and billing details.",
};

export default function SubscriptionSettingsPage() {
  return (
    <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <SubscriptionPage />
    </div>
  );
}