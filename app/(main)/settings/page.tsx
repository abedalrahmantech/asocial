import { UserProfile } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, billing, and subscription.
          </p>
        </CardHeader>
        <CardContent>
          <UserProfile routing="hash" />
        </CardContent>
      </Card>
    </div>
  );
}
