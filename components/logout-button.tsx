"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: "/" })} className="rounded-lg border border-blue-100 px-3 py-2 text-sm font-semibold text-wisepix-800">
      Sair
    </button>
  );
}
