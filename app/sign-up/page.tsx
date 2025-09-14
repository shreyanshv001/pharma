import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101A23]">
      <SignUp path="/sign-up" routing="path" signInUrl="/sign-in"/>
    </div>
  );
}
