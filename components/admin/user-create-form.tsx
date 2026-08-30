"use client";

import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createUser } from "@/app/admin/actions";
import { toast } from "@/components/ui/toaster";
import { randomToken } from "@/lib/utils";

type State =
  | { ok?: boolean; message?: string; error?: string; fieldErrors?: Record<string, string[]> }
  | null;

function Err({ e }: { e?: string[] }) {
  if (!e?.length) return null;
  return <p className="mt-1 text-xs text-negative">{e[0]}</p>;
}

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button className="btn btn-primary" disabled={pending}>
      {pending ? "Creating…" : "Create user"}
    </button>
  );
}

export function UserCreateForm() {
  const router = useRouter();
  const [state, action] = useActionState<State, FormData>(createUser, null);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CUSTOMER" | "ADMIN">("CUSTOMER");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      toast(state.message ?? "User created", "success");
      router.push("/admin/customers");
      router.refresh();
    }
  }, [state, router]);

  const fe = state?.fieldErrors;

  return (
    <form ref={formRef} action={action} className="max-w-lg space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="uc-name">Full name</label>
          <input id="uc-name" name="name" className="input" required />
          <Err e={fe?.name} />
        </div>
        <div>
          <label className="label" htmlFor="uc-phone">Phone (optional)</label>
          <input
            id="uc-phone"
            name="phone"
            inputMode="tel"
            className="input"
            placeholder="01XXXXXXXXX"
          />
          <Err e={fe?.phone} />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="uc-email">Email</label>
        <input
          id="uc-email"
          name="email"
          type="email"
          autoComplete="off"
          className="input"
          required
        />
        <Err e={fe?.email} />
      </div>

      <div>
        <label className="label" htmlFor="uc-password">Temporary password</label>
        <div className="flex gap-2">
          <input
            id="uc-password"
            name="password"
            type="text"
            autoComplete="off"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            required
          />
          <button
            type="button"
            className="btn btn-outline btn-sm whitespace-nowrap"
            onClick={() =>
              setPassword(
                randomToken(
                  14,
                  "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789",
                ),
              )
            }
          >
            Generate
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-2">
          Share this with the user — they can change it later at{" "}
          <span>/account</span> (or Settings for admins).
        </p>
        <Err e={fe?.password} />
      </div>

      <div>
        <label className="label" htmlFor="uc-role">Role</label>
        <select
          id="uc-role"
          name="role"
          value={role}
          onChange={(e) => setRole(e.target.value as "CUSTOMER" | "ADMIN")}
          className="select"
        >
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin — full access to this panel</option>
        </select>
        {role === "ADMIN" && (
          <p className="mt-1 text-xs text-negative">
            Admins can see orders, customers, settings and everything else. Only
            add people you trust.
          </p>
        )}
      </div>

      {state?.error && (
        <p className="border border-[#b03636]/40 bg-[#b03636]/10 px-3 py-2 text-xs text-negative">
          {state.error}
        </p>
      )}

      <SubmitBtn />
    </form>
  );
}
