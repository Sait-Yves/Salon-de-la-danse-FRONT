"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAccount } from "../services/auth";
import { saveProfile } from "../services/planning";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    photo: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createAccount(formData.email, formData.password);
    const persistProfile = (photoDataUrl?: string) => {
      saveProfile({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone,
        photoDataUrl,
        idUnique: `BEN-2027-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      router.push("/dashboard");
    };

    if (formData.photo) {
      const reader = new FileReader();
      reader.onload = () => persistProfile(String(reader.result));
      reader.readAsDataURL(formData.photo);
      return;
    }

    persistProfile();
  };

  return (
    <main className="surface-grain min-h-[calc(100vh-5rem)] px-4 py-12 flex justify-center items-start">
      <div className="animate-fade-up w-full max-w-2xl rounded-3xl border border-[#7A291E]/10 bg-white p-8 shadow-[0_10px_40px_-12px_rgba(62,21,15,0.25)] md:p-10">
        <div className="mb-8 border-b border-[#7A291E]/10 pb-6">
          <span className="inline-block rounded-full bg-[#7A291E]/10 px-3 py-1 font-['Montserrat'] text-[11px] font-bold uppercase tracking-wider text-[#7A291E]">
            Étape 1 / 2
          </span>
          <h1 className="mt-3 font-['Montserrat'] text-2xl font-extrabold text-[#333333] md:text-3xl">
            Création de votre compte bénévole
          </h1>
          <p className="mt-1 text-sm text-[#666666]">
            Veuillez renseigner vos informations personnelles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="nom" className="field-label">
                Nom
              </label>
              <input
                id="nom"
                type="text"
                required
                className="field"
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="prenom" className="field-label">
                Prénom
              </label>
              <input
                id="prenom"
                type="text"
                required
                className="field"
                onChange={(e) =>
                  setFormData({ ...formData, prenom: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="field-label">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="field"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="telephone" className="field-label">
                Téléphone
              </label>
              <input
                id="telephone"
                type="tel"
                required
                className="field"
                onChange={(e) =>
                  setFormData({ ...formData, telephone: e.target.value })
                }
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label">
                Mot de passe sécurisé
              </label>
              <input
                id="password"
                type="password"
                required
                className="field"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label htmlFor="photo" className="field-label">
              Photo récente (Obligatoire pour l&apos;édition de badge)
            </label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              required
              className="w-full rounded-xl border border-dashed border-[#7A291E]/25 bg-[#7A291E]/[0.03] p-3 text-sm text-[#666666] transition hover:border-[#7A291E]/50 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#7A291E]/10 file:px-4 file:py-2 file:font-['Montserrat'] file:text-sm file:font-bold file:text-[#7A291E] hover:file:bg-[#7A291E]/20"
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.files?.[0] || null })
              }
            />
          </div>

          <button
            type="submit"
            className="btn-pill btn-pill-primary w-full mt-2"
          >
            Valider mon profil et continuer
          </button>
        </form>
      </div>
    </main>
  );
}
