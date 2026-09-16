'use client'

import { DeactivationControls } from '@/components/deactivation-controls'
import { deactivateGatekeeperAction } from '@/actions/gatekeepers'

export function GatekeeperStatusControls({
  gatekeeperId,
  isActive,
}: {
  gatekeeperId: string
  isActive: boolean
}) {
  return (
    <DeactivationControls
      entityId={gatekeeperId}
      entityIdFieldName="gatekeeper_id"
      entityLabel="Gatekeeper"
      isActive={isActive}
      reactivateHref={`/champion/gatekeepers/${gatekeeperId}/reactivate`}
      deactivateAction={deactivateGatekeeperAction}
    />
  )
}
