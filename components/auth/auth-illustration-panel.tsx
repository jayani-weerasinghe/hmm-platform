export function AuthIllustrationPanel() {
  return (
    <div className="relative hidden flex-1 overflow-hidden lg:block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/login-illustration.png"
        alt=""
        className="h-full w-full object-cover"
      />
    </div>
  )
}
