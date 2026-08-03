import { AuthLeftPanel } from '@/components/auth/auth-left-panel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#EDEEF2] flex">
      <AuthLeftPanel />
      <div className="flex flex-1 items-center justify-center py-12 pl-2 pr-12 lg:py-20 lg:pl-4 lg:pr-20">
        <div className="w-full max-w-[480px]">
          {children}
        </div>
      </div>
    </div>
  )
}
