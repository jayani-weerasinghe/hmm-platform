'use client'

import { DeactivationControls } from '@/components/deactivation-controls'
import { deactivateChampionAction, type ChampionActionState } from '@/actions/champions'

export function ChampionStatusControls({
  championId,
  isActive,
}: {
  championId: string
  isActive: boolean
  clubIsActive: boolean
}) {
  return (
    <DeactivationControls
      entityId={championId}
      entityIdFieldName="champion_id"
      entityLabel="Champion"
      isActive={isActive}
      reactivateHref={`/super-admin/champions/${championId}/reactivate`}
      deactivateAction={deactivateChampionAction}
      extraWarning={(result: ChampionActionState) =>
        result?.soleChampion
          ? 'This champion was the sole active champion in their club. The club now has no active champions.'
          : null
      }
    />
  )
}
