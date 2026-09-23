"use client";

import { useState, useEffect } from "react";
import { fetchUsers, updateUserPlanningStatus, generateInvitationCodes, exportCsv } from "../services/admin";
import type { CurrentUser } from "../services/auth";

export default function AdminDashboardPage() {
  const [benevoles, setBenevoles] = useState<CurrentUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"Tous" | "Validé" | "En attente">("Tous");
  
  const [numCodes, setNumCodes] = useState(1);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    setIsLoading(true);
    const users = await fetchUsers();
    setBenevoles(users);
    setIsLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredBenevoles = benevoles.filter(
    (b) =>
      (b.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.mission && b.mission.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (statusFilter === "Tous" || b.statut_planning === statusFilter.toLowerCase()),
  );

  const toggleStatut = async (id: number, currentStatus: string | undefined) => {
    const action = currentStatus === "valide" ? "deverrouiller" : "valider";
    const success = await updateUserPlanningStatus(id, action);
    if (success) {
      await loadUsers(); // Recharge la liste pour refléter le changement
    } else {
      alert("Erreur lors de la modification du statut.");
    }
  };

  const handleExportCsv = async () => {
    const csvContent = await exportCsv();
    if (csvContent) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(
        new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" }),
      );
      link.download = "benevoles-salon-danse.csv";
      link.click();
      URL.revokeObjectURL(link.href);
    } else {
      alert("Erreur lors de l'export CSV.");
    }
  };

  const handleGenerateCodes = async (event: React.FormEvent) => {
    event.preventDefault();
    setAdminMessage("Génération en cours...");
    const response = await generateInvitationCodes(numCodes);
    if (response && response.codes) {
      setGeneratedCodes(response.codes);
      setAdminMessage(`Génération réussie : ${response.codes.length} code(s).`);
    } else {
      setAdminMessage("Erreur lors de la génération des codes.");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="font-['Montserrat'] text-xl font-bold text-[#7A291E] animate-pulse">Chargement de l'espace admin...</p>
      </main>
    );
  }

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
          <button
            onClick={handleExportCsv}
            className="btn-pill btn-pill-inverse text-xs !py-2.5 !px-4"
          >
            Export CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="official-card p-6">
          <h2 className="font-['Montserrat'] text-lg font-bold text-[#333333]">
            Générer des codes d'invitation
          </h2>
          <p className="mt-1 text-sm text-[#666666]">
            Ces codes permettent aux futurs bénévoles de s'inscrire.
          </p>
          <form onSubmit={handleGenerateCodes} className="mt-5 space-y-4">
            <input
              type="number"
              min="1"
              max="50"
              required
              value={numCodes}
              onChange={(event) => setNumCodes(parseInt(event.target.value))}
              placeholder="Nombre de codes"
              className="field"
            />
            <button type="submit" className="btn-pill btn-pill-primary w-full">
              Générer
            </button>
          </form>
          {generatedCodes.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-semibold text-amber-800">
                Codes générés
              </p>
              <div className="mt-1 max-h-32 overflow-y-auto space-y-1">
                {generatedCodes.map((c, i) => (
                  <p key={i} className="font-mono text-sm font-bold text-amber-950">
                    {c}
                  </p>
                ))}
              </div>
            </div>
          )}
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
            Liste des Bénévoles
          </h2>
          <input
            type="text"
            placeholder="Rechercher par nom, prénom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="field md:w-80"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
            className="field md:w-36"
          >
            <option>Tous</option>
            <option>Validé</option>
            <option>En attente</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#7A291E]/10 font-['Montserrat'] text-[11px] uppercase tracking-wider text-[#999]">
                <th className="py-3 px-4">Bénévole</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Mission Assignée</th>
                <th className="py-3 px-4">Statut Planning</th>
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
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${b.isMineur ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-[#7A291E]/8 text-[#7A291E]"}`}
                    >
                      {b.mission || "Non assigné"}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${b.statut_planning === "valide" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                    >
                      {b.statut_planning === "valide" ? "Validé" : "En attente"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => toggleStatut(b.id, b.statut_planning)}
                      className="btn-pill btn-pill-ghost text-xs !py-2 !px-3.5"
                    >
                      {b.statut_planning === "valide" ? "Déverrouiller" : "Valider"}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBenevoles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">Aucun bénévole trouvé.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
