"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@rems.com");
  const [password, setPassword] = useState("demo123");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const user = await api.login(email, password);
      localStorage.setItem("rems-demo-user", JSON.stringify(user));
      setMessage(`Logged in as ${user.fullName} (${user.role}).`);
      setError(null);
      router.push("/");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-md">
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-card-foreground">Demo Login</CardTitle>
            <CardDescription>
              Use one of the seeded REMS accounts to validate the backend auth endpoint.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {message ? <p className="text-sm text-primary">{message}</p> : null}
              <Button className="w-full" type="submit">Sign In</Button>
            </form>

            <div className="mt-6 space-y-2 text-sm text-muted-foreground">
              <p>Seeded accounts:</p>
              <p>`admin@rems.com` / `demo123`</p>
              <p>`manager@rems.com` / `demo123`</p>
              <p>`leah.agent@rems.com` / `demo123`</p>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm">
              <Link href="/" className="text-primary hover:underline">Go to dashboard</Link>
              <Link href="/spaces" className="text-primary hover:underline">Open public portal</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
