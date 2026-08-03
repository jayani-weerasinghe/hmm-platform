'use client'

import { usePathname } from 'next/navigation'
import Image from 'next/image'

const CONTENT: Record<string, { headline: string; sub: string }> = {
  '/login': {
    headline: 'Grow the Gatekeeper network.',
    sub: 'Onboarding, events, resources and certification tracking for every club.',
  },
  '/forgot-password': {
    headline: "We'll get you back in.",
    sub: 'Password resets are sent to the email your administrator registered.',
  },
  '/reset-password': {
    headline: 'Choose a new password.',
    sub: "You'll use it next time you sign in to the HMM platform.",
  },
}

export function AuthLeftPanel() {
  const pathname = usePathname()
  const content = CONTENT[pathname] ?? CONTENT['/login']

  return (
    <div className="hidden lg:flex flex-1 flex-col items-center justify-center gap-8 pl-16 pr-2 py-16">
      <Image
          src="/login-vector.png"
          alt="Healing Minds Matter illustration"
          width={600}
          height={600}
          className="w-full max-w-[360px] h-auto"
          priority
        />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#1B2B4A]">{content.headline}</h2>
        <p className="mt-3 max-w-[300px] mx-auto text-base leading-relaxed text-gray-500">
          {content.sub}
        </p>
      </div>
    </div>
  )
}
