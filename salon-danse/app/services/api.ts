const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function verifyInvitationCode(code: string) {
  const response = await fetch(`${API_BASE_URL}/invitations/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  return response.json();
}

export async function registerUser(userData: FormData) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    body: userData,
  });
  return response.json();
}

export async function getCreneauxByEdition(editionId: number) {
  const response = await fetch(`${API_BASE_URL}/editions/${editionId}/creneaux`);
  return response.json();
}

export async function saveUserReservations(userId: number, creneauIds: number[]) {
  const response = await fetch(`${API_BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, creneau_ids: creneauIds }),
  });
  return response.json();
}