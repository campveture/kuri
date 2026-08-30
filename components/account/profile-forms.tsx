"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, saveAddress } from "@/app/(site)/account/actions";

type Address = {
  fullName: string;
  phone: string;
  line1: string;
  area: string;
  city: string;
};

type State = {
  ok?: boolean;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
} | null;

function Msg({ state }: { state: State }) {
  if (state?.error)
    return <p className="mt-2 text-xs text-negative">{state.error}</p>;
  if (state?.ok)
    return <p className="mt-2 text-xs text-gold-deep">{state.message}</p>;
  return null;
}

function SaveBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      className="btn btn-sm btn-ghost mt-4 w-full text-xs"
      disabled={pending}
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

export function ProfileForms({
  user,
  defaultAddress,
}: {
  user: { name: string; phone: string | null };
  defaultAddress: Address | null;
}) {
  const [pState, pAction] = useActionState<State, FormData>(updateProfile, null);
  const [aState, aAction] = useActionState<State, FormData>(saveAddress, null);
  const phone = user.phone ?? "";

  return (
    <div className="mt-3 grid gap-6 md:grid-cols-2">
      <form action={pAction} className="card p-5">
        <h3 className="label">Profile</h3>
        <label className="label mt-2" htmlFor="pf-name">Name</label>
        <input id="pf-name" name="name" defaultValue={user.name} className="input" required />
        <label className="label mt-3" htmlFor="pf-phone">Phone</label>
        <input id="pf-phone" name="phone" defaultValue={phone} className="input" required />
        <SaveBtn label="Save profile" />
        <Msg state={pState} />
      </form>

      <form action={aAction} className="card p-5">
        <h3 className="label">Default delivery address</h3>
        <label className="label mt-2" htmlFor="ad-fullName">Full name</label>
        <input
          id="ad-fullName"
          name="fullName"
          defaultValue={defaultAddress?.fullName ?? user.name}
          className="input"
          required
        />
        <label className="label mt-3" htmlFor="ad-phone">Phone</label>
        <input
          id="ad-phone"
          name="phone"
          defaultValue={defaultAddress?.phone ?? phone}
          className="input"
          required
        />
        <label className="label mt-3" htmlFor="ad-line1">Address</label>
        <input
          id="ad-line1"
          name="line1"
          defaultValue={defaultAddress?.line1 ?? ""}
          className="input"
          required
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="ad-area">Area</label>
            <input
              id="ad-area"
              name="area"
              defaultValue={defaultAddress?.area ?? ""}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="ad-city">City</label>
            <input
              id="ad-city"
              name="city"
              defaultValue={defaultAddress?.city ?? "Dhaka"}
              className="input"
              required
            />
          </div>
        </div>
        <SaveBtn label="Save address" />
        <Msg state={aState} />
      </form>
    </div>
  );
}
