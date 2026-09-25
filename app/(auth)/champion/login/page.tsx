import { Suspense } from 'react'
import { LoginForm } from '../../login/login-form'

export const metadata = { title: 'Champion Sign In — HMM Platform' }

export default function ChampionLoginPage() {
  return (
    <Suspense>
      <LoginForm portal="champion" />
    </Suspense>
  )
}
