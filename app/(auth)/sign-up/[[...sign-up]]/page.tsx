import { SignUp } from "@clerk/nextjs";

export default async function Page(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const hasTicket = Boolean(searchParams.__clerk_ticket);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md px-4">
      {hasTicket && (
        <div className="w-full rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs text-center space-y-1">
          <p className="text-sm font-medium text-foreground">
            You&apos;ve been invited to join a clinic on ClinicSeva.
          </p>
          <p className="text-xs text-muted-foreground">
            Create your account to accept the invitation.
          </p>
        </div>
      )}
      <SignUp fallbackRedirectUrl="/continue" />
    </div>
  );
}