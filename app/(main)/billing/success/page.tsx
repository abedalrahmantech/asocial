"use client";

import { useEffect, useState } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { CLERK_BILLING } from "@/lib/clerk/billing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function BillingSuccessPage() {
  const { session } = useClerk();
  const { has, isLoaded } = useAuth();
  const [attempts, setAttempts] = useState(0);
  const [ready, setReady] = useState(false);

  const isPremium =
    has?.({ feature: CLERK_BILLING.features.aiChat }) ||
    has?.({ plan: CLERK_BILLING.plans.premium });

  useEffect(() => {
    if (isPremium) {
      setReady(true);
      return;
    }
    if (attempts >= 8) {
      setReady(true);
      return;
    }

    const timer = window.setTimeout(() => {
      void session?.reload().then(() => setAttempts((n) => n + 1));
    }, 800);

    return () => window.clearTimeout(timer);
  }, [isPremium, attempts, session, isLoaded]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <h1 className="text-2xl font-bold">Welcome to Premium!</h1>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isLoaded || (!ready && !isPremium) ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Activating your subscription…
            </div>
          ) : isPremium ? (
            <p className="text-muted-foreground">
              Your Premium plan is active. Enjoy long posts, AI chat, and more.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Payment received. If features don&apos;t appear yet, sign out and
              back in, or manage billing in settings.
            </p>
          )}
          <Link href="/">
            <Button className="w-full">Back to feed</Button>
          </Link>
          <Link href="/settings" className="text-sm text-primary hover:underline">
            Manage billing
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
