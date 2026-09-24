"use client";

import { adminRemoveInscritAction } from "../../../services/actions";
import ConfirmButton from "../ConfirmButton";

export default function RemoveInscrit({ userId, reservationId, locked }: { userId: number; reservationId: number; locked: boolean }) {
  return (
    <ConfirmButton
      label="Retirer"
      confirm="Confirmer le retrait ?"
      action={() => adminRemoveInscritAction(userId, reservationId, locked)}
    />
  );
}
