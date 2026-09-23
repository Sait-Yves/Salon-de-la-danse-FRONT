"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { registerAction } from "../services/auth";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get("code") || "";

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    photo: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!invitationCode) {
      setError("Code d'invitation manquant. Veuillez passer par la page de connexion.");
      setIsLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("nom", formData.nom);
      data.append("prenom", formData.prenom);
      data.append("email", formData.email);
      data.append("telephone", formData.telephone);
      data.append("password", formData.password);
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      const result = await registerAction(data, invitationCode);
      
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!invitationCode) {
    return (
      <div className="animate-fade-up w-full max-w-xl rounded-3xl border border-[#7A291E]/10 bg-white p-8 shadow-[0_10px_40px_-12px_rgba(62,21,15,0.25)] md:p-10 text-center">
        <h1 className="font-['Montserrat'] text-2xl font-extrabold text-[#333333] mb-4">
          Accès Restreint
        </h1>
        <p className="text-[#666666] mb-6">
          Vous devez disposer d'un code d'invitation valide pour créer un compte bénévole. 
          Si vous en avez un, veuillez passer par la page de connexion.
        </p>
        <button
          onClick={() => router.push("/login?mode=code")}
          className="btn-pill btn-pill-primary"
        >
          Saisir mon code d'invitation
        </button>
      </div>
    );
  }

  return (
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
            Photo récente (pour votre badge)
          </label>
          <input
            id="photo"
            type="file"
            accept="image/*"
            className="w-full rounded-xl border border-dashed border-[#7A291E]/25 bg-[#7A291E]/[0.03] p-3 text-sm text-[#666666] transition hover:border-[#7A291E]/50 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-[#7A291E]/10 file:px-4 file:py-2 file:font-['Montserrat'] file:text-sm file:font-bold file:text-[#7A291E] hover:file:bg-[#7A291E]/20"
            onChange={(e) =>
              setFormData({ ...formData, photo: e.target.files?.[0] || null })
            }
          />
        </div>

        {error && (
          <p className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            ⚠️ {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-pill btn-pill-primary w-full mt-2 disabled:opacity-50"
        >
          {isLoading ? "Inscription en cours..." : "Valider mon profil et continuer"}
        </button>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <main className="surface-grain min-h-[calc(100vh-5rem)] px-4 py-12 flex justify-center items-start">
      <Suspense fallback={<p>Chargement du formulaire...</p>}>
        <RegisterForm />
      </Suspense>
    </main>
  );
}
