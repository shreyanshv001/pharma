import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { EditQuestionForm } from "@/components/EditQuestionForm";

export default async function EditQuestionPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <SignedIn>
        <EditQuestionForm id={params.id} />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
