export function AuthIllustrationPanel() {
  return (
    <div className="hidden flex-1 items-stretch justify-center overflow-hidden lg:flex">
      {/* The box is locked to the source image's own 711:900 aspect ratio and
          capped by both max-w-full and h-full, so it always shrinks to fit
          whichever dimension (available width or height) is tighter —
          object-cover then has nothing left to crop, since the box and the
          image always share the same ratio. This is what actually fixes the
          "tagline/logo cropped at short viewport heights" bug: the old
          plain flex-1 box let the container's aspect ratio drift arbitrarily
          far from the image's, forcing object-cover to trim real content. */}
      <div className="relative aspect-[711/900] h-full max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/login-illustration.png"
          alt=""
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
