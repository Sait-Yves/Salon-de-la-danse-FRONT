"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  addAdmin,
  generateLoginCode,
  getAdminEmailList,
  getCurrentUser,
} from "../services/auth";

interface BenevoleAdmin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mission: string;
  statut: "Validé" | "En attente";
  isSensible: boolean;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [codeEmail, setCodeEmail] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [adminMessage, setAdminMessage] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (getCurrentUser()?.role !== "admin") {
        router.replace("/dashboard");
        return;
      }

      setAdminEmails(getAdminEmailList());
      setAuthorized(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [router]);

  const [benevoles, setBenevoles] = useState<BenevoleAdmin[]>([
    {
      id: 1,
      nom: "Dupont",
      prenom: "Camille",
      email: "camille@example.com",
      mission: "Accueil exposants",
      statut: "Validé",
      isSensible: false,
    },
    {
      id: 2,
      nom: "Martin",
      prenom: "Lucas",
      email: "lucas@example.com",
      mission: "Billetterie (Sensible)",
      statut: "En attente",
      isSensible: true,
    },
    {
      id: 3,
      nom: "Bernard",
      prenom: "Sarah",
      email: "sarah@example.com",
      mission: "Vestiaires",
      statut: "Validé",
      isSensible: false,
    },
  ]);

  const filteredBenevoles = benevoles.filter(
    (b) =>
      b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.mission.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleStatut = (id: number) => {
    setBenevoles(
      benevoles.map((b) =>
        b.id === id
          ? { ...b, statut: b.statut === "Validé" ? "En attente" : "Validé" }
          : b,
      ),
    );
  };

  const handleGenerateCode = (event: React.FormEvent) => {
    event.preventDefault();
    setGeneratedCode(generateLoginCode(codeEmail));
    setAdminMessage(
      "Code généré. Il ne pourra être utilisé qu’une seule fois.",
    );
  };

  const handleAddAdmin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!addAdmin(newAdminEmail)) {
      setAdminMessage("Cet e-mail est déjà administrateur ou invalide.");
      return;
    }

    setAdminEmails(getAdminEmailList());
    setNewAdminEmail("");
    setAdminMessage("Administrateur ajouté.");
  };

  if (!authorized) return null;

  return (
    <main className="min-h-[calc(100vh-5rem)] p-5 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="banner-gradient animate-rise flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <h1 className="font-['Montserrat'] text-2xl md:text-3xl font-black tracking-tight">
            Back-Office Administrateur
          </h1>
          <p className="text-sm text-white/70 mt-1">
            Supervision globale et gestion des plannings (Salon de la Danse)
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-pill btn-pill-inverse text-xs !py-2.5 !px-4">
            Export Excel / CSV
          </button>
          <button className="btn-pill btn-pill-inverse text-xs !py-2.5 !px-4">
            Générer Badges PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Bénévoles",
            value: "130",
            color: "text-white",
            icon: "👥",
          },
          {
            label: "Plannings Validés",
            value: "98",
            color: "text-emerald-600",
            icon: "✅",
          },
          {
            label: "En attente / Brouillon",
            value: "32",
            color: "text-amber-600",
            icon: "⏳",
          },
          {
            label: "Taux de Remplissage",
            value: "85%",
            color: "text-[#7A291E]",
            icon: "📈",
          },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`official-card official-card-hover animate-fade-up delay-${i + 1} p-5`}
          >
            <div className="flex items-center justify-between">
              <span className="font-['Montserrat'] text-[11px] font-bold uppercase tracking-wider text-[#999]">
                {stat.label}
              </span>
              <span className="text-base opacity-70">{stat.icon}</span>
            </div>
            <p
              className={`mt-2 font-['Montserrat'] text-3xl font-black ${stat.color}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="official-card p-6">
          <h2 className="font-['Montserrat'] text-lg font-bold text-[#333333]">
            Générer un code de connexion
          </h2>
          <p className="mt-1 text-sm text-[#666666]">
            Le code est lié à l&apos;e-mail indiqué et devient invalide après sa
            première utilisation.
          </p>
          <form onSubmit={handleGenerateCode} className="mt-5 space-y-4">
            <input
              type="email"
              required
              value={codeEmail}
              onChange={(event) => setCodeEmail(event.target.value)}
              placeholder="E-mail du bénéficiaire"
              className="field"
            />
            <button type="submit" className="btn-pill btn-pill-primary w-full">
              Générer le code
            </button>
          </form>
          {generatedCode && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-800">
                Code à transmettre
              </p>
              <p className="mt-1 font-mono text-lg font-bold tracking-wider text-amber-950">
                {generatedCode}
              </p>
            </div>
          )}
        </div>

        <div className="official-card p-6">
          <h2 className="font-['Montserrat'] text-lg font-bold text-[#333333]">
            Ajouter un administrateur
          </h2>
          <p className="mt-1 text-sm text-[#666666]">
            L&apos;e-mail ajouté pourra accéder à l&apos;espace admin après sa
            connexion.
          </p>
          <form onSubmit={handleAddAdmin} className="mt-5 space-y-4">
            <input
              type="email"
              required
              value={newAdminEmail}
              onChange={(event) => setNewAdminEmail(event.target.value)}
              placeholder="nouvel-admin@exemple.fr"
              className="field"
            />
            <button type="submit" className="btn-pill btn-pill-primary w-full">
              Ajouter l&apos;administrateur
            </button>
          </form>
          <div className="mt-5 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-[#999999]">
              Administrateurs autorisés
            </p>
            {adminEmails.map((email) => (
              <p key={email} className="text-sm text-[#666666]">
                {email}
              </p>
            ))}
          </div>
        </div>
      </section>

      {adminMessage && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {adminMessage}
        </p>
      )}

      <div className="official-card animate-fade-up delay-2 p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
          <h2 className="font-['Montserrat'] text-lg font-bold text-[#333333]">
            Liste des Bénévoles &amp; Postes
          </h2>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field md:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#7A291E]/10 font-['Montserrat'] text-[11px] uppercase tracking-wider text-[#999]">
                <th className="py-3 px-4">Bénévole</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Mission Assignée</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#7A291E]/8 text-sm">
              {filteredBenevoles.map((b) => (
                <tr key={b.id} className="transition hover:bg-[#7A291E]/[0.03]">
                  <td className="py-4 px-4 font-semibold text-[#333333]">
                    {b.prenom} {b.nom}
                  </td>
                  <td className="py-4 px-4 text-[#666666]">{b.email}</td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${b.isSensible ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-[#7A291E]/8 text-[#7A291E]"}`}
                    >
                      {b.mission}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${b.statut === "Validé" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                    >
                      {b.statut}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => toggleStatut(b.id)}
                      className="btn-pill btn-pill-ghost text-xs !py-2 !px-3.5"
                    >
                      Modifier / Forcer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
