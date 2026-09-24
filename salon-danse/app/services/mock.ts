// MODE DÉMO — utilisé uniquement si API_MOCK=1 (tests locaux, jamais en production).
// Reproduit les formats et les règles du back Laravel de Louis.
/* eslint-disable @typescript-eslint/no-explicit-any */

type MUser = {
  id: number; nom: string; prenom: string; email: string; telephone: string;
  role: "admin" | "benevole"; isMineur: boolean; statut_planning: "brouillon" | "valide"; photo: boolean;
};
type MCreneau = { id: number; mission_id: number; jour: string; debut: string; fin: string; cap: number };
type MMission = { id: number; nom: string; sensible: boolean };
type MRes = { id: number; user_id: number; creneau_id: number; statut: "brouillon" | "valide" };
type State = {
  users: MUser[]; missions: MMission[]; creneaux: MCreneau[]; res: MRes[];
  codes: { id: number; code: string; isActive: boolean }[]; nextRes: number; nextUser: number; nextCode: number;
  nextMission?: number; nextCreneau?: number;
};

const DAYS = ["2026-10-09", "2026-10-10", "2026-10-11"];
const SLOTS: [string, string][] = [["08:30", "10:00"], ["10:00", "12:00"], ["12:00", "14:00"], ["14:00", "16:00"], ["16:00", "18:00"]];
const MISSIONS = [
  "Accueil exposants", "Vestiaires", "Point Info", "Masterclass / Conférences", "Loges danseurs",
  "Logistique", "Scène principale", "Stand JayDance", "Village Danses du Monde",
];
const NOMS = ["Martin", "Bernard", "Moreau", "Petit", "Durand", "Leroy", "Simon", "Laurent", "Lefebvre", "Michel", "Garcia", "David", "Bertrand", "Roux"];
const PRENOMS = ["Camille", "Hugo", "Léa", "Lucas", "Emma", "Louis", "Chloé", "Jules", "Manon", "Nathan", "Inès", "Tom", "Sarah", "Noé"];

class MockHttp extends Error {
  constructor(public status: number, public body: any) { super("mock"); }
}
const biz = (msg: string, status = 409) => new MockHttp(status, { message: msg });
const invalid = (field: string, msg: string) => new MockHttp(422, { message: msg, errors: { [field]: [msg] } });

function schedule(slots: MCreneau[]) {
  if (slots.length > 3) throw biz("Maximum trois créneaux sur le week-end.");
  for (const day of DAYS) {
    const o = slots.filter((s) => s.jour === day).sort((a, b) => a.debut.localeCompare(b.debut));
    let run = 1;
    for (let i = 1; i < o.length; i++) {
      if (o[i].debut < o[i - 1].fin) throw biz("Deux réservations ne peuvent pas se chevaucher.");
      run = o[i].debut === o[i - 1].fin ? run + 1 : 1;
      if (run >= 3) throw biz("Trois créneaux consécutifs sont interdits : prévoyez une pause.");
    }
  }
}

function seed(): State {
  const missions: MMission[] = [
    ...MISSIONS.map((nom, i) => ({ id: i + 1, nom, sensible: false })),
    { id: 10, nom: "Billetterie", sensible: true },
    { id: 11, nom: "Caisse", sensible: true },
  ];
  const creneaux: MCreneau[] = [];
  let id = 1;
  for (const jour of DAYS) for (const [debut, fin] of SLOTS) for (const m of missions) {
    creneaux.push({ id: id++, mission_id: m.id, jour, debut, fin, cap: m.sensible ? 2 : 4 + ((id * 7) % 9) });
  }
  const users: MUser[] = [
    { id: 1, nom: "Admin", prenom: "Salon", email: "admin@salon.test", telephone: "0600000001", role: "admin", isMineur: false, statut_planning: "brouillon", photo: false },
    { id: 2, nom: "Dupont", prenom: "Élodie", email: "benevole@salon.test", telephone: "0600000002", role: "benevole", isMineur: false, statut_planning: "brouillon", photo: true },
  ];
  for (let i = 3; i <= 40; i++) {
    users.push({
      id: i, nom: NOMS[i % NOMS.length], prenom: PRENOMS[(i * 3) % PRENOMS.length],
      email: `benevole${i}@exemple.fr`, telephone: `06000000${String(i).padStart(2, "0")}`, role: "benevole",
      isMineur: i % 9 === 0, statut_planning: i % 3 === 0 ? "valide" : "brouillon", photo: i % 4 !== 0,
    });
  }
  const res: MRes[] = [];
  const nextRes = 1;
  const state: State = { users, missions, creneaux, res, codes: [{ id: 1, code: "DANSE2027", isActive: true }, { id: 2, code: "YJYJPYWL", isActive: true }, { id: 3, code: "YE6W9W3X", isActive: true }, { id: 4, code: "YSVZQLTG", isActive: true }, { id: 5, code: "C7BKFZSX", isActive: true }, { id: 6, code: "Q22YT7N9", isActive: true }, { id: 7, code: "DSQ5G5DV", isActive: true }, { id: 8, code: "8VG2ZT5P", isActive: true }, { id: 9, code: "65Q2TMD8", isActive: true }, { id: 10, code: "FXPYBQPE", isActive: true }, { id: 11, code: "RE8ZTTXL", isActive: true }], nextRes, nextUser: 41, nextCode: 12 };
  for (const u of users.filter((x) => x.role === "benevole" && x.id > 2)) {
    const want = 1 + (u.id % 3);
    for (let k = 0; k < 40 && res.filter((r) => r.user_id === u.id).length < want; k++) {
      const c = creneaux[(u.id * 13 + k * 17) % creneaux.length];
      const m = missions.find((x) => x.id === c.mission_id)!;
      if (m.sensible) continue;
      const mine = res.filter((r) => r.user_id === u.id).map((r) => creneaux.find((x) => x.id === r.creneau_id)!);
      if (mine.some((x) => x.id === c.id)) continue;
      if (res.filter((r) => r.creneau_id === c.id).length >= c.cap) continue;
      try { schedule([...mine, c]); } catch { continue; }
      res.push({ id: state.nextRes++, user_id: u.id, creneau_id: c.id, statut: u.statut_planning });
    }
  }
  return state;
}

const g = globalThis as any;
const S = (): State => (g.__salonMock ??= seed());

const uJson = (u: MUser, admin: boolean) => ({
  id: u.id, nom: u.nom, prenom: u.prenom, email: u.email, telephone: u.telephone, role: u.role,
  isMineur: u.isMineur, statut_planning: u.statut_planning,
  photo_url: u.photo ? (admin ? `/api/admin/users/${u.id}/photo` : "/api/me/photo") : null,
});
const cJson = (c: MCreneau, admin: boolean, withCount: boolean) => {
  const s = S();
  const m = s.missions.find((x) => x.id === c.mission_id)!;
  return {
    id: c.id, jour: c.jour, heure_debut: `${c.debut}:00`, heure_fin: `${c.fin}:00`, capacite_max: c.cap,
    ...(withCount ? { places_restantes: Math.max(0, c.cap - s.res.filter((r) => r.creneau_id === c.id).length) } : {}),
    mission: { id: m.id, edition_id: 1, nom: m.nom, ...(admin ? { isSensible: m.sensible } : {}) },
  };
};
const rJson = (r: MRes, admin: boolean) => {
  const c = S().creneaux.find((x) => x.id === r.creneau_id)!;
  return { id: r.id, statut: r.statut, ...(admin ? { user_id: r.user_id } : {}), creneau: cJson(c, admin, false) };
};
function paginate<T>(arr: T[], page: number, per: number) {
  const last = Math.max(1, Math.ceil(arr.length / per));
  return {
    data: arr.slice((page - 1) * per, page * per),
    links: {}, meta: { current_page: page, last_page: last, per_page: per, total: arr.length },
  };
}
const json = (status: number, body: any) =>
  new Response(status === 204 ? null : JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function filterUsers(q: URLSearchParams) {
  return S().users.filter((u) => {
    const t = (q.get("q") ?? "").toLowerCase();
    if (t && !`${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(t)) return false;
    if (q.get("role") && u.role !== q.get("role")) return false;
    if (q.get("statut_planning") && u.statut_planning !== q.get("statut_planning")) return false;
    if (q.get("isMineur") && u.isMineur !== (q.get("isMineur") === "1")) return false;
    return true;
  }).sort((a, b) => a.nom.localeCompare(b.nom) || a.prenom.localeCompare(b.prenom) || a.id - b.id);
}

function addRes(user: MUser, creneauId: number, admin: boolean): MRes {
  const s = S();
  const c = s.creneaux.find((x) => x.id === creneauId);
  if (!c) throw new MockHttp(404, { message: "Ressource introuvable." });
  const m = s.missions.find((x) => x.id === c.mission_id)!;
  if (!admin && m.sensible) throw new MockHttp(404, { message: "Ressource introuvable." });
  if (!admin && user.statut_planning === "valide") throw biz("Planning validé : seul un administrateur peut le modifier.");
  const mine = s.res.filter((r) => r.user_id === user.id);
  if (mine.some((r) => r.creneau_id === c.id)) throw biz("Vous avez déjà réservé ce créneau.");
  schedule([...mine.map((r) => s.creneaux.find((x) => x.id === r.creneau_id)!), c]);
  if (s.res.filter((r) => r.creneau_id === c.id).length >= c.cap) throw biz("Ce créneau est complet.");
  const r: MRes = { id: s.nextRes++, user_id: user.id, creneau_id: c.id, statut: user.statut_planning };
  s.res.push(r);
  return r;
}

async function handle(path: string, init: RequestInit, token: string | null): Promise<Response> {
  const s = S();
  const url = new URL(`http://mock${path}`);
  const p = url.pathname;
  const q = url.searchParams;
  const method = (init.method ?? "GET").toUpperCase();
  const body: any = typeof init.body === "string" ? JSON.parse(init.body) : init.body instanceof FormData ? Object.fromEntries(init.body.entries()) : {};
  const me = token?.startsWith("mock-") ? s.users.find((u) => u.id === Number(token.slice(5))) : undefined;
  const pub = (method === "POST" && (p === "/login" || p === "/register"));
  if (!pub && !me) throw new MockHttp(401, { message: "Unauthenticated." });
  const admin = p.startsWith("/admin");
  if (admin && me?.role !== "admin") throw new MockHttp(403, { message: "This action is unauthorized." });
  let m: RegExpMatchArray | null = null;

  if (method === "POST" && p === "/login") {
    const u = s.users.find((x) => x.email === String(body.email ?? "").toLowerCase());
    if (!u || !body.password) throw invalid("email", "Identifiants incorrects.");
    return json(200, { data: { user: uJson(u, false), token: `mock-${u.id}`, token_type: "Bearer" } });
  }
  if (method === "POST" && p === "/register") {
    for (const f of ["nom", "prenom", "email", "telephone", "password", "code_invitation"]) if (!body[f]) throw invalid(f, "Ce champ est obligatoire.");
    if (String(body.password).length < 8) throw invalid("password", "Le mot de passe doit contenir au moins 8 caractères.");
    if (body.password !== body.password_confirmation) throw invalid("password", "La confirmation du mot de passe ne correspond pas.");
    if (s.users.some((u) => u.email === String(body.email).toLowerCase())) throw invalid("email", "Cette adresse email est déjà utilisée.");
    const code = s.codes.find((c) => c.code === body.code_invitation && c.isActive);
    if (!code) throw invalid("code_invitation", "Code invalide ou déjà utilisé.");
    code.isActive = false;
    const u: MUser = {
      id: s.nextUser++, nom: body.nom, prenom: body.prenom, email: String(body.email).toLowerCase(), telephone: body.telephone,
      role: "benevole", isMineur: body.isMineur === "1" || body.isMineur === true, statut_planning: "brouillon", photo: !!body.photo,
    };
    s.users.push(u);
    return json(201, { data: { user: uJson(u, false), token: `mock-${u.id}`, token_type: "Bearer" } });
  }
  if (method === "POST" && p === "/logout") return json(204, null);
  if (method === "GET" && p === "/me") return json(200, { data: uJson(me!, false) });
  if (method === "GET" && (p === "/me/photo" || (m = p.match(/^\/admin\/users\/(\d+)\/photo$/)))) {
    const u = m ? s.users.find((x) => x.id === Number(m![1])) : me;
    if (!u || !u.photo) throw new MockHttp(404, { message: "Ressource introuvable." });
    const ini = `${u.prenom[0]}${u.nom[0]}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="#7A291E"/><text x="120" y="145" font-family="Arial" font-size="88" font-weight="700" fill="#fff" text-anchor="middle">${ini}</text></svg>`;
    return new Response(svg, { status: 200, headers: { "Content-Type": "image/svg+xml" } });
  }
  if (method === "GET" && (p === "/creneaux" || p === "/admin/creneaux")) {
    let list = s.creneaux.filter((c) => admin || !s.missions.find((x) => x.id === c.mission_id)!.sensible);
    if (q.get("jour")) list = list.filter((c) => c.jour === q.get("jour"));
    if (q.get("mission_id")) list = list.filter((c) => c.mission_id === Number(q.get("mission_id")));
    const pg = paginate(list, Number(q.get("page") ?? 1), Number(q.get("per_page") ?? 50));
    return json(200, { ...pg, data: pg.data.map((c) => cJson(c, admin, true)) });
  }
  if (method === "GET" && (p === "/planning" || p === "/reservations")) {
    const mine = s.res.filter((r) => r.user_id === me!.id && !s.missions.find((x) => x.id === s.creneaux.find((c) => c.id === r.creneau_id)!.mission_id)!.sensible);
    return json(200, { data: mine.map((r) => rJson(r, false)) });
  }
  if (method === "POST" && p === "/reservations") return json(201, { data: rJson(addRes(me!, Number(body.creneau_id), false), false) });
  if (method === "DELETE" && (m = p.match(/^\/reservations\/(\d+)$/))) {
    const r = s.res.find((x) => x.id === Number(m![1]) && x.user_id === me!.id);
    if (!r) throw new MockHttp(404, { message: "Ressource introuvable." });
    if (me!.statut_planning === "valide") throw biz("Planning validé : seul un administrateur peut le modifier.");
    s.res.splice(s.res.indexOf(r), 1);
    return json(204, null);
  }
  if (method === "POST" && p === "/planning/valider") {
    if (!s.res.some((r) => r.user_id === me!.id)) throw biz("Réservez au moins un créneau avant de valider le planning.");
    me!.statut_planning = "valide";
    s.res.filter((r) => r.user_id === me!.id).forEach((r) => (r.statut = "valide"));
    return json(200, { data: uJson(me!, false) });
  }
  if (method === "GET" && p === "/planning/pdf") {
    const pdf = "%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 100]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF";
    return new Response(pdf, { status: 200, headers: { "Content-Type": "application/pdf", "Content-Disposition": 'attachment; filename="planning.pdf"' } });
  }

  /* ---- admin ---- */
  if (method === "GET" && (m = p.match(/^\/admin\/users\/(\d+)$/))) {
    const u = s.users.find((x) => x.id === Number(m![1]));
    if (!u) throw new MockHttp(404, { message: "Ressource introuvable." });
    return json(200, { data: uJson(u, true) });
  }
  if (method === "GET" && p === "/admin/plannings") {
    const list = s.users.filter((u) => !q.get("role") || u.role === q.get("role"));
    return json(200, { data: list.map((u) => ({ ...uJson(u, true), reservations: s.res.filter((r) => r.user_id === u.id).map((r) => rJson(r, true)) })) });
  }
  if (method === "GET" && (m = p.match(/^\/admin\/creneaux\/(\d+)\/inscrits$/))) {
    const c = s.creneaux.find((x) => x.id === Number(m![1]));
    if (!c) throw new MockHttp(404, { message: "Ressource introuvable." });
    const list = s.res.filter((r) => r.creneau_id === c.id);
    return json(200, { data: {
      creneau: cJson(c, true, true),
      places_restantes: Math.max(0, c.cap - list.length),
      inscrits: list.map((r) => ({ reservation_id: r.id, statut: r.statut, user: uJson(s.users.find((u) => u.id === r.user_id)!, true) })),
    } });
  }

  /* ---- missions et créneaux : contrat proposé à Louis (pas encore dans le back) ---- */
  const mJson = (x: MMission) => ({ id: x.id, edition_id: 1, nom: x.nom, isSensible: x.sensible });
  const bool = (v: any) => v === true || v === 1 || v === "1" || v === "true";
  const hhmmOk = (v: any) => /^\d{2}:\d{2}(:\d{2})?$/.test(String(v ?? ""));
  if (method === "GET" && p === "/admin/missions") return json(200, { data: s.missions.map(mJson) });
  if (method === "POST" && p === "/admin/missions") {
    const nom = String(body.nom ?? "").trim();
    if (!nom) throw invalid("nom", "Le nom de la mission est obligatoire.");
    if (s.missions.some((x) => x.nom.toLowerCase() === nom.toLowerCase())) throw invalid("nom", "Une mission porte déjà ce nom.");
    s.nextMission ??= Math.max(0, ...s.missions.map((x) => x.id)) + 1;
    const x: MMission = { id: s.nextMission++, nom, sensible: bool(body.isSensible) };
    s.missions.push(x);
    return json(201, { data: mJson(x) });
  }
  if ((method === "PATCH" || method === "DELETE") && (m = p.match(/^\/admin\/missions\/(\d+)$/))) {
    const x = s.missions.find((y) => y.id === Number(m![1]));
    if (!x) throw new MockHttp(404, { message: "Ressource introuvable." });
    if (method === "PATCH") {
      if (body.nom !== undefined) {
        const nom = String(body.nom).trim();
        if (!nom) throw invalid("nom", "Le nom de la mission est obligatoire.");
        x.nom = nom;
      }
      if (body.isSensible !== undefined) x.sensible = bool(body.isSensible);
      return json(200, { data: mJson(x) });
    }
    const ids = s.creneaux.filter((c) => c.mission_id === x.id).map((c) => c.id);
    const n = s.res.filter((r) => ids.includes(r.creneau_id)).length;
    if (n > 0) throw biz(`Impossible de supprimer : ${n} bénévole${n > 1 ? "s sont inscrits" : " est inscrit"} sur cette mission.`);
    s.creneaux = s.creneaux.filter((c) => c.mission_id !== x.id);
    s.missions.splice(s.missions.indexOf(x), 1);
    return json(204, null);
  }
  function checkCreneau(c: { jour: string; debut: string; fin: string; cap: number }) {
    if (!DAYS.includes(c.jour)) throw invalid("jour", "Le jour doit être compris dans les dates de l'édition.");
    if (!(c.fin > c.debut)) throw invalid("heure_fin", "L'heure de fin doit être après l'heure de début.");
    if (!(c.cap >= 1)) throw invalid("capacite_max", "La capacité doit être d'au moins 1 place.");
  }
  if (method === "POST" && p === "/admin/creneaux") {
    const mission = s.missions.find((x) => x.id === Number(body.mission_id));
    if (!mission) throw invalid("mission_id", "Choisissez une mission.");
    if (!hhmmOk(body.heure_debut)) throw invalid("heure_debut", "Heure de début invalide.");
    if (!hhmmOk(body.heure_fin)) throw invalid("heure_fin", "Heure de fin invalide.");
    const c: MCreneau = { id: 0, mission_id: mission.id, jour: String(body.jour ?? ""), debut: String(body.heure_debut).slice(0, 5), fin: String(body.heure_fin).slice(0, 5), cap: Number(body.capacite_max) };
    checkCreneau(c);
    s.nextCreneau ??= Math.max(0, ...s.creneaux.map((x) => x.id)) + 1;
    c.id = s.nextCreneau++;
    s.creneaux.push(c);
    return json(201, { data: cJson(c, true, true) });
  }
  if ((method === "PATCH" || method === "DELETE") && (m = p.match(/^\/admin\/creneaux\/(\d+)$/))) {
    const c = s.creneaux.find((x) => x.id === Number(m![1]));
    if (!c) throw new MockHttp(404, { message: "Ressource introuvable." });
    const n = s.res.filter((r) => r.creneau_id === c.id).length;
    if (method === "DELETE") {
      if (n > 0) throw biz(`Impossible de supprimer : ${n} bénévole${n > 1 ? "s sont inscrits" : " est inscrit"} sur ce créneau. Retirez-les d'abord.`);
      s.creneaux.splice(s.creneaux.indexOf(c), 1);
      return json(204, null);
    }
    const next = {
      jour: body.jour !== undefined ? String(body.jour) : c.jour,
      debut: body.heure_debut !== undefined ? String(body.heure_debut).slice(0, 5) : c.debut,
      fin: body.heure_fin !== undefined ? String(body.heure_fin).slice(0, 5) : c.fin,
      cap: body.capacite_max !== undefined ? Number(body.capacite_max) : c.cap,
    };
    checkCreneau(next);
    if (next.cap < n) throw invalid("capacite_max", `${n} bénévoles sont déjà inscrits : la capacité ne peut pas être inférieure.`);
    Object.assign(c, next);
    return json(200, { data: cJson(c, true, true) });
  }

  if (method === "GET" && p === "/admin/users") {
    const pg = paginate(filterUsers(q), Number(q.get("page") ?? 1), Number(q.get("per_page") ?? 50));
    return json(200, { ...pg, data: pg.data.map((u) => uJson(u, true)) });
  }
  if ((method === "PATCH" || method === "POST") && (m = p.match(/^\/admin\/users\/(\d+)$/))) {
    const u = s.users.find((x) => x.id === Number(m![1]));
    if (!u) throw new MockHttp(404, { message: "Ressource introuvable." });
    for (const f of ["nom", "prenom", "email", "telephone"] as const) if (body[f] !== undefined) (u as any)[f] = body[f];
    if (body.isMineur !== undefined) u.isMineur = body.isMineur === "1" || body.isMineur === true;
    if (body.photo) u.photo = true;
    return json(200, { data: uJson(u, true) });
  }
  if (method === "PATCH" && (m = p.match(/^\/admin\/users\/(\d+)\/role$/))) {
    const u = s.users.find((x) => x.id === Number(m![1]));
    if (!u) throw new MockHttp(404, { message: "Ressource introuvable." });
    if (body.role !== "admin" && body.role !== "benevole") throw invalid("role", "Le rôle doit être admin ou benevole.");
    if (body.role === "benevole" && u.id === me!.id) throw biz("Vous ne pouvez pas retirer vos propres droits d'administrateur.");
    if (body.role === "benevole" && u.role === "admin" && s.users.filter((x) => x.role === "admin").length === 1) throw biz("Impossible de rétrograder le dernier administrateur.");
    u.role = body.role;
    return json(200, { data: uJson(u, true) });
  }
  if (method === "GET" && (m = p.match(/^\/admin\/users\/(\d+)\/planning$/))) {
    return json(200, { data: s.res.filter((r) => r.user_id === Number(m![1])).map((r) => rJson(r, true)) });
  }
  if (method === "POST" && (m = p.match(/^\/admin\/users\/(\d+)\/planning\/(valider|deverrouiller)$/))) {
    const u = s.users.find((x) => x.id === Number(m![1]));
    if (!u) throw new MockHttp(404, { message: "Ressource introuvable." });
    if (m[2] === "valider" && !s.res.some((r) => r.user_id === u.id)) throw biz("Réservez au moins un créneau avant de valider le planning.");
    u.statut_planning = m[2] === "valider" ? "valide" : "brouillon";
    s.res.filter((r) => r.user_id === u.id).forEach((r) => (r.statut = u.statut_planning));
    return json(200, { data: uJson(u, true) });
  }
  if (method === "POST" && p === "/admin/reservations") {
    const u = s.users.find((x) => x.id === Number(body.user_id));
    if (!u) throw new MockHttp(404, { message: "Ressource introuvable." });
    return json(201, { data: rJson(addRes(u, Number(body.creneau_id), true), true) });
  }
  if (method === "DELETE" && (m = p.match(/^\/admin\/reservations\/(\d+)$/))) {
    const r = s.res.find((x) => x.id === Number(m![1]));
    if (!r) throw new MockHttp(404, { message: "Ressource introuvable." });
    const u = s.users.find((x) => x.id === r.user_id)!;
    if (u.statut_planning === "valide" && s.res.filter((x) => x.user_id === u.id).length === 1) {
      throw biz("Déverrouillez le planning avant de supprimer sa dernière réservation.");
    }
    s.res.splice(s.res.indexOf(r), 1);
    return json(204, null);
  }
  if (method === "POST" && p === "/admin/invitation-codes") {
    const n = Number(body.nombre);
    if (!(n >= 1 && n <= 200)) throw invalid("nombre", "Le nombre doit être compris entre 1 et 200.");
    const out = Array.from({ length: n }, () => {
      const c = { id: s.nextCode++, code: Math.random().toString(16).slice(2, 14).toUpperCase() + "A1B2C3D4", isActive: true };
      s.codes.push(c);
      return c;
    });
    return json(201, { data: out });
  }
  if (method === "POST" && p === "/admin/invitations") {
    if (s.users.some((u) => u.email === String(body.email).toLowerCase())) throw invalid("email", "Cette adresse est déjà inscrite.");
    const c = { id: s.nextCode++, code: "INV" + Math.random().toString(16).slice(2, 12).toUpperCase(), isActive: true };
    s.codes.push(c);
    return json(201, { data: c, message: "Invitation transmise au service d’envoi." });
  }
  if (method === "GET" && p === "/admin/export") {
    const rows = filterUsers(q).map((u) => [u.nom, u.prenom, u.email, u.telephone, u.statut_planning, u.isMineur ? "oui" : "non"].join(";"));
    return new Response("﻿Nom;Prénom;Email;Téléphone;Statut;Mineur\n" + rows.join("\n"), {
      status: 200, headers: { "Content-Type": "text/csv; charset=UTF-8", "Content-Disposition": 'attachment; filename="benevoles.csv"' },
    });
  }
  throw new MockHttp(404, { message: "Ressource introuvable." });
}

export async function mockFetch(path: string, init: RequestInit, token: string | null): Promise<Response> {
  try {
    return await handle(path, init, token);
  } catch (e) {
    if (e instanceof MockHttp) return json(e.status, e.body);
    throw e;
  }
}
