import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata = { title: 'Sign In — HMM Platform' }

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm portal="super_admin" />
    </Suspense>
  )
}
