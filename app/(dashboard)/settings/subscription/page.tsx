import { SubscriptionPage } from "@/modules/subscriptions/components/subscription-page";
export const metadata = {
    title: "Subscription | ClinicOS Settings",
    description: "Manage your ClinicOS subscription.",
};
export default function SubscriptionSettingsPage() {
    return (
        <div className="container mx-auto max-w-7xl p-4 sm:p-6 lg:p-2">
            <SubscriptionPage />
        </div>
    );
}
