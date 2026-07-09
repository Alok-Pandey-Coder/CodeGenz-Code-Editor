"use client"
import React, { ChangeEvent, FormEvent, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    cnf_password: "",
  })
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const params = useParams();
  const token = params.token as string; // route [token] se seedha nikal lo

  const handleChanges = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (formData.cnf_password !== formData.password) {
      toast.error("Passwords do not match");
      return; // loading abhi set hi nahi hua, so no stuck state
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,               // params se seedha, stale state ka issue nahi
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong while resetting the password");
        toast.error(data.error || "Unable to reset password");
        return;
      }

      toast.success("Password changed successfully");
      router.push("/login");
    } catch (err) {
      setError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>
          Enter your new password here!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="A$23456fgh"
                value={formData.password}
                onChange={handleChanges}
                required
                minLength={8}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cnf_password">Confirm New Password</Label>
              <Input
                id="cnf_password"
                name="cnf_password"
                type="password"
                placeholder="A$23456fgh"
                value={formData.cnf_password}
                onChange={handleChanges}
                required
                minLength={8}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}