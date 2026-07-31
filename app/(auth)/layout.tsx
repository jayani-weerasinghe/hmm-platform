export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Healing Minds Matter</h1>
          <p className="mt-1 text-sm text-gray-500">Platform Administration</p>
        </div>
        {children}
      </div>
    </div>
  )
}
