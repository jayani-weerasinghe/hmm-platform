import { AuthIllustrationPanel } from '@/components/auth/auth-illustration-panel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col gap-4 bg-[#FFF8EE] p-4 lg:flex-row lg:items-stretch lg:gap-8 lg:p-8">
      <div className="flex flex-1 items-center justify-center rounded-3xl bg-white py-10 lg:max-w-[697px]">
        <div className="w-full max-w-[411px] px-4 lg:px-0">
          {children}
        </div>
      </div>
      <AuthIllustrationPanel />
    </div>
  )
}
