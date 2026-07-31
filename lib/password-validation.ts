// Client-safe — no server-only imports

const COMMON_PASSWORDS = new Set([
  'Password1!', 'Password123!', 'Admin123!', 'Welcome1!', 'Qwerty123!',
  'Passw0rd!', 'P@ssw0rd', 'P@ssword1', 'Summer2024!', 'Winter2024!',
  'Spring2024!', 'Autumn2024!', 'Abc12345!', 'Test1234!', 'Hello123!',
  'Dragon123!', 'Master123!', 'Login123!', 'Password@1', 'Changeme1!',
  'Letmein1!', 'Monkey123!', 'Shadow123!', 'Sunshine1!', 'Princess1!',
  'Welcome123!', 'iloveyou1A!', 'Trustno1!', 'Football1!', 'Baseball1!',
])

export interface UserContext {
  name?: string | null
  email?: string | null
}

export interface PasswordValidationResult {
  valid: boolean
  errors: string[]
}

export function validatePassword(
  password: string,
  ctx: UserContext = {}
): PasswordValidationResult {
  const errors: string[] = []

  if (password.length < 8)
    errors.push('At least 8 characters long')
  if (!/[A-Z]/.test(password))
    errors.push('At least one uppercase letter')
  if (!/[a-z]/.test(password))
    errors.push('At least one lowercase letter')
  if (!/[0-9]/.test(password))
    errors.push('At least one number')
  if (!/[!@#$%^&*]/.test(password))
    errors.push('At least one special character (!@#$%^&*)')

  const lower = password.toLowerCase()

  if (ctx.name) {
    const parts = ctx.name.toLowerCase().split(/\s+/).filter(p => p.length > 2)
    if (parts.some(part => lower.includes(part)))
      errors.push('Cannot contain your name')
  }

  if (ctx.email) {
    const local = ctx.email.split('@')[0].toLowerCase()
    if (local.length > 2 && lower.includes(local))
      errors.push('Cannot contain your email address')
  }

  if (COMMON_PASSWORDS.has(password))
    errors.push('This password is too commonly used — choose a more unique one')

  return { valid: errors.length === 0, errors }
}

// For real-time UI feedback — checks rules only (no name/email context needed)
export function checkPasswordRules(password: string) {
  return {
    minLength:    password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber:    /[0-9]/.test(password),
    hasSpecial:   /[!@#$%^&*]/.test(password),
  }
}
