import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/site/Logo";
import { ArrowRight, Loader2, Mail, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/dashboard",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    redirectAfterAuth,
  );
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (error) {
      console.error("Guest login error:", error);
      setError(
        `Failed to sign in as guest: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-carbon">
      <div className="absolute inset-0 bg-grid" />
      <div className="absolute inset-0 bg-mesh-lime" />
      <div className="grain absolute inset-0" />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>

          <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/50">
            {step === "signIn" ? (
              <>
                <div className="mb-6 text-center">
                  <p className="micro-label text-lime">
                    STRENGTH · SPEED · DISCIPLINE
                  </p>
                  <h1 className="headline-xl mt-3 text-3xl text-bone">
                    ENTER THE FLOOR
                  </h1>
                  <p className="mt-2 text-sm text-ash">
                    Enter your email to log in or sign up. We&apos;ll send a
                    one-time code.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 size-4 text-ash" />
                    <Input
                      name="email"
                      placeholder="name@example.com"
                      type="email"
                      className="h-12 border-white/10 bg-carbon pl-10 text-bone placeholder:text-ash/60"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-flame" role="alert">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="h-12 w-full gap-2 bg-lime text-carbon hover:bg-lime/90 glow-lime"
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        Send Code
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-4">
                  <span className="h-px flex-1 bg-white/10" />
                  <span className="micro-label text-[9px]!">OR</span>
                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full gap-2 border-white/15 text-bone hover:border-lime/50 hover:text-lime"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                >
                  <UserX className="size-4" />
                  Continue as Guest
                </Button>
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <p className="micro-label text-lime">CHECK YOUR INBOX</p>
                  <h1 className="headline-xl mt-3 text-3xl text-bone">
                    ENTER THE CODE
                  </h1>
                  <p className="mt-2 text-sm text-ash">
                    We&apos;ve sent a 6-digit code to{" "}
                    <span className="font-data text-bone">{step.email}</span>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && otp.length === 6 && !isLoading) {
                          const form = (e.target as HTMLElement).closest("form");
                          if (form) form.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="size-11 rounded-lg border border-white/15 bg-carbon font-data text-lg text-lime"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && (
                    <p className="text-center text-sm text-flame" role="alert">
                      {error}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="h-12 w-full gap-2 bg-lime text-carbon hover:bg-lime/90 glow-lime"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <>
                        Verify & Enter
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("signIn")}
                    disabled={isLoading}
                    className="w-full text-ash hover:text-bone"
                  >
                    Use different email
                  </Button>
                </form>
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-ash/70">
            First visit? Booking a free trial creates your member account.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}
