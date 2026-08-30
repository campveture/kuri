"use client";

import { useEffect, useRef } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePassword } from "@/app/(site)/account/actions";
import { toast } from "@/components/ui/toaster";

type State = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-sm btn-ghost mt-4 w-full text-xs" disabled={pending}>
      {pending ? "Saving…" : "Change password"}
    </button>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState<State, FormData>(changePassword, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast(state.message ?? "Password changed", "success");
      formRef.current?.reset();
    } else if (state?.error) {
      toast(state.error, "error");
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="card p-5">
      <h3 className="label">Change password</h3>

      <label className="label mt-2" htmlFor="cp-current">Current password</label>
      <input
        id="cp-current"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        className="input"
        required
      />

      <label className="label mt-3" htmlFor="cp-new">New password</label>
      <input
        id="cp-new"
        name="newPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        className="input"
        required
      />

      <label className="label mt-3" htmlFor="cp-confirm">Confirm new password</label>
      <input
        id="cp-confirm"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        minLength={8}
        className="input"
        required
      />

      {state?.error ? (
        <p className="mt-2 text-xs text-negative">{state.error}</p>
      ) : null}
      <SubmitBtn />
    </form>
  );
}
