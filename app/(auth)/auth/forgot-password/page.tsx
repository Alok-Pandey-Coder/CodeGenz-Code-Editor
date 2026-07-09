"use client"
import React, {useState} from 'react'
import { useRouter } from 'next/navigation'
import {toast} from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChanges = (e:React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }

  const handleOnSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

   try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }), // ye bhi missing tha
      });

      if (!res.ok) {
        setError("Something went wrong while sending email");
        toast.error("Failed to send reset email");
        return;
      }

      toast.success("Email sent successfully");
      setEmail("");
    } catch (err) {
      setError("Network error, please try again");
      toast.error("Something went wrong");
    } finally {
      setLoading(false); // ye chahe success ho ya error, hamesha chalega
    }
  }
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Forgot Password</CardTitle>
        <CardDescription>
          Enter your email below to reset password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleOnSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={handleChanges}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

