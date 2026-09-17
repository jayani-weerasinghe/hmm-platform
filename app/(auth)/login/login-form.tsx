'use client'

import { useActionState, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loginAction } from '@/actions/auth'

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'
  const errorParam = searchParams.get('error')
  const sessionExpired = errorParam === 'session_expired'
  const forcedLogoutMessage =
    errorParam === 'club_inactive' ? 'Your club is currently inactive. Please contact your administrator.' :
    errorParam === 'account_inactive' ? 'Your account has been deactivated. Please contact an administrator.' :
    null

  const hasBanner = resetSuccess || sessionExpired || forcedLogoutMessage || state?.error

  return (
    <div className="w-full font-[family-name:var(--font-inter)]">
      <div className="flex flex-col gap-[7px]">
        <h1 className="text-[28px] font-black leading-none tracking-[0.28px] text-[#012C51] sm:text-[34px] sm:tracking-[0.34px]">
          Sign in
        </h1>
        <p className="text-[15px] leading-[1.56] tracking-[0.15px] text-[#67707F] sm:text-[18px] sm:tracking-[0.18px]">
          For Super Admins and Champions.
        </p>
      </div>

      {hasBanner && (
        <div className="mt-4 flex flex-col gap-3 sm:mt-6">
          {resetSuccess && (
            <div className="rounded-lg bg-[#E6FFE7] px-4 py-3 text-sm text-[#16A34A]">
              Password reset successfully. Please sign in with your new password.
            </div>
          )}
          {sessionExpired && (
            <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-[#D97706]">
              Your session expired due to inactivity. Please sign in again.
            </div>
          )}
          {forcedLogoutMessage && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[#DC2626]">
              {forcedLogoutMessage}
            </div>
          )}
          {state?.error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-[#DC2626]" role="alert">
              {state.error}
            </div>
          )}
        </div>
      )}

      <form action={formAction} className="mt-8 flex flex-col gap-[60px] sm:mt-10">
        <div className="flex flex-col gap-[9px]">
          <div className="flex flex-col gap-[24px]">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-[14px] tracking-[0.14px] text-[#0C1421]">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@healingmindsmatter.org"
                className="h-12 w-full rounded-lg border border-[#D4D7E3] bg-[#F7FBFF] px-4 text-[14px] tracking-[0.14px] text-[#0C1421] outline-none transition placeholder:text-[#8897AD] focus:border-[#F4AC1E] focus:ring-2 focus:ring-[#F4AC1E]/20"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-[14px] tracking-[0.14px] text-[#0C1421]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="At least 8 characters"
                  className="h-12 w-full rounded-lg border border-[#D4D7E3] bg-[#F7FBFF] px-4 pr-11 text-[14px] tracking-[0.14px] text-[#0C1421] outline-none transition placeholder:text-[#8897AD] focus:border-[#F4AC1E] focus:ring-2 focus:ring-[#F4AC1E]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8897AD] hover:text-[#67707F]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={showPassword ? '/icons/pw-eye.svg' : '/icons/pw-eye-off.svg'} alt="" className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-[7px]">
              <span className="relative inline-block size-[18px] shrink-0">
                <input
                  type="checkbox"
                  name="keep_signed_in"
                  className="peer absolute inset-0 size-full cursor-pointer opacity-0"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/checkbox-unchecked.svg"
                  alt=""
                  className="absolute inset-0 size-full peer-checked:opacity-0"
                />
                <span className="absolute inset-0 hidden items-center justify-center rounded-[3px] bg-[#F4AC1E] peer-checked:flex">
                  <svg viewBox="0 0 12 10" className="h-[7px] w-[9px]" fill="none" aria-hidden="true">
                    <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
              <span className="text-[14px] tracking-[0.14px] text-[#67707F]">Keep me signed in</span>
            </label>
            <Link
              href="/forgot-password"
              className="text-[14px] font-bold tracking-[0.14px] text-[#265BA2] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-[#F4AC1E] py-4 text-[16px] font-semibold tracking-[0.16px] text-white transition hover:bg-[#e0991a] disabled:opacity-60"
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
