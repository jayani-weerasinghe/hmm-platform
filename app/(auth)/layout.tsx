import { AuthIllustrationPanel } from '@/components/auth/auth-illustration-panel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh flex-col gap-3 overflow-hidden bg-[#FFF8EE] p-3 sm:gap-4 sm:p-4 lg:flex-row lg:items-stretch lg:gap-8 lg:p-8">
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto rounded-2xl bg-white py-6 sm:rounded-3xl sm:py-10 lg:w-[697px] lg:flex-none">
        <div className="w-full max-w-[411px] px-4 lg:px-0">
          {children}
        </div>
      </div>
      <AuthIllustrationPanel />
    </div>
  )
}
