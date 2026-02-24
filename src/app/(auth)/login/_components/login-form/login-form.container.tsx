"use client";

import { useLoginForm } from "./login-form.hook";
import { LoginFormView } from "./login-form.view";

export function LoginForm() {
  const props = useLoginForm();
  return <LoginFormView {...props} />;
}
