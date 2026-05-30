import { PricingTable } from "@clerk/nextjs";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PricingPage() {
  return (
    <div className="p-6">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <h1 className="text-3xl font-bold">Asocial Premium</h1>
          <p className="text-muted-foreground">
            Long posts, verified badge, AI chat, edit window, and more. Billed
            in USD via Clerk Billing (Stripe payment processing).
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          {/* B2C: User Plans tab in Clerk Dashboard — not Organization Plans */}
          <PricingTable
            for="user"
            newSubscriptionRedirectUrl="/billing/success"
          />
        </CardContent>
      </Card>
    </div>
  );
}
