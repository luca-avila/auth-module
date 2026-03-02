import { useSearchParams } from "react-router-dom";

import { VerifyEmailView } from "../features/verify-email/components/VerifyEmailView";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return <VerifyEmailView token={token} />;
}

