import { SubscriptionPage } from "@/modules/subscriptions/components/subscription-page";

export const metadata = {
  title: "Subscription Settings | ClinicSeva",
  description: "Manage your ClinicSeva subscription and billing details.",
};

export default function SubscriptionSettingsPage() {
  return (
    <div className="space-y-6">
      <SubscriptionPage />
    </div>
  );
}