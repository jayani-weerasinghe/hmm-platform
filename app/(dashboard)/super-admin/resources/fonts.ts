import { Archivo, Manrope } from 'next/font/google'

// Scoped to the Resources section only (per the resources-design reference),
// not the app-wide font (which stays Plus Jakarta Sans / Inter — see
// app/layout.tsx). Archivo for headings/numbers, Manrope for body text.
export const archivo = Archivo({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})
