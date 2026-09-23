"use server";

import { fetchAPI } from "./api";
import type { CurrentUser } from "./auth";

export async function fetchUsers() {
  const res = await fetchAPI("/admin/users");
  if (res.ok) {
    return res.json();
  }
  return [];
}

export async function updateUserPlanningStatus(userId: number, action: "valider" | "deverrouiller") {
  const res = await fetchAPI(`/admin/users/${userId}/planning/${action}`, {
    method: "POST"
  });
  return res.ok;
}

export async function generateInvitationCodes(nombre: number) {
  const res = await fetchAPI("/admin/invitation-codes", {
    method: "POST",
    body: JSON.stringify({ nombre })
  });
  if (res.ok) {
    return res.json();
  }
  return null;
}

export async function exportCsv() {
  const res = await fetchAPI("/admin/export");
  if (res.ok) {
    return res.text();
  }
  return null;
}
