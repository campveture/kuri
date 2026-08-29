"use client";

import { useActionState } from "react";
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
        <label className="label mt-2">Name</label>
        <input name="name" defaultValue={user.name} className="input" required />
        <label className="label mt-3">Phone</label>
        <input name="phone" defaultValue={phone} className="input" required />
        <button className="btn btn-sm btn-ghost mt-4 w-full text-xs">
          Save profile
        </button>
        <Msg state={pState} />
      </form>

      <form action={aAction} className="card p-5">
        <h3 className="label">Default delivery address</h3>
        <label className="label mt-2">Full name</label>
        <input
          name="fullName"
          defaultValue={defaultAddress?.fullName ?? user.name}
          className="input"
          required
        />
        <label className="label mt-3">Phone</label>
        <input
          name="phone"
          defaultValue={defaultAddress?.phone ?? phone}
          className="input"
          required
        />
        <label className="label mt-3">Address</label>
        <input
          name="line1"
          defaultValue={defaultAddress?.line1 ?? ""}
          className="input"
          required
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="label">Area</label>
            <input
              name="area"
              defaultValue={defaultAddress?.area ?? ""}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              name="city"
              defaultValue={defaultAddress?.city ?? "Dhaka"}
              className="input"
              required
            />
          </div>
        </div>
        <button className="btn btn-sm btn-ghost mt-4 w-full text-xs">
          Save address
        </button>
        <Msg state={aState} />
      </form>
    </div>
  );
}
