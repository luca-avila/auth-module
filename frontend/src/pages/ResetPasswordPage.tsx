import { useSearchParams } from "react-router-dom";

import { ResetPasswordView } from "../features/reset-password/components/ResetPasswordView";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  return <ResetPasswordView token={token} />;
}

