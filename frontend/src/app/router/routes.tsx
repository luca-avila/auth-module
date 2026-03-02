import { Navigate, Route, Routes } from "react-router-dom";

import { ResetPasswordPage } from "../../pages/ResetPasswordPage";
import { RootPage } from "../../pages/RootPage";
import { VerifyEmailPage } from "../../pages/VerifyEmailPage";
import { ROUTE_PATHS } from "./routePaths";

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.root} element={<RootPage />} />
      <Route path={ROUTE_PATHS.verifyEmail} element={<VerifyEmailPage />} />
      <Route path={ROUTE_PATHS.resetPassword} element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to={ROUTE_PATHS.root} replace />} />
    </Routes>
  );
}

