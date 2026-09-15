import { resourceTypeVisual } from './design-tokens'

// Thumbnail-block visual for a resource type — real exported Figma icon
// assets on a type-tinted background. Resources have no image/thumbnail
// field, so this stands in for the design's photo treatment (which this
// data model has no honest equivalent for) the same way the type-icon block
// already did before this rebuild.
export function ResourceTypeIcon({ type }: { type: string }) {
  const visual = resourceTypeVisual(type)

  if (type === 'video') {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,255,255,0.9)] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={visual.icon} alt="" width={visual.iconSize} height={visual.iconSize} className="ml-0.5" />
      </div>
    )
  }

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={visual.icon} alt="" width={visual.iconSize} height={visual.iconSize} />
}
