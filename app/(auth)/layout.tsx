import { AuthIllustrationPanel } from '@/components/auth/auth-illustration-panel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    // Figma's "Login" frame (fileKey K1Csx2BjbSmP9NRSDtoEe2, node 144:20) has
    // no explicit gap between the left card and the right illustration — the
    // card is a fixed 697px-wide box with 32px margin on every side of the
    // 1440x900 frame, and the illustration content is loose, not a second
    // bounded panel with its own declared width. There's no single Figma
    // number for "the right panel's width" to copy, so the two sides are
    // made equal (lg:flex-1 on both, replacing a previous fixed-697px-left +
    // unbounded-flex-1-right split that grew arbitrarily lopsided at wide
    // viewports) and flush (no gap class at lg — a previous lg:gap-8 was an
    // extra 32px this frame never actually shows between the two sides).
    // The one real, explicit Figma margin value (32px on every edge of the
    // whole frame) is kept via lg:p-8 on this outer container.
    <div className="flex h-dvh flex-col gap-3 overflow-hidden bg-[#FFF8EE] p-3 sm:gap-4 sm:p-4 lg:flex-row lg:items-stretch lg:gap-0 lg:p-8">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-2xl bg-white py-6 sm:rounded-3xl sm:py-10">
        <div className="w-full max-w-[411px] px-4 lg:px-0">
          {children}
        </div>
      </div>
      <AuthIllustrationPanel />
    </div>
  )
}
