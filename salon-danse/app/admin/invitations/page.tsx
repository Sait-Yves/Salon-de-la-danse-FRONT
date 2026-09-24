import InvitationForms from "./InvitationForms";

export default function InvitationsPage() {
  return (
    <>
      <div className="banner-gradient animate-rise">
        <h1 className="font-['Montserrat'] text-2xl font-black">Invitations</h1>
        <p className="text-sm text-white/75">Donnez accès à la plateforme aux bénévoles.</p>
      </div>
      <InvitationForms />
    </>
  );
}
