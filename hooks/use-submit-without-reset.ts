'use client'

import { startTransition, type FormEvent } from 'react'

// React 19 clears a <form action={...}> automatically once its action
// finishes — even when the action returns an error — so one bad field (a
// duplicate email, say) wiped everything the user had typed, including a
// chosen CSV/upload file. That automatic reset only applies to the form
// `action` prop, so these forms submit through onSubmit instead:
//
//   const [state, formAction, isPending] = useActionState(someAction, null)
//   const submit = useSubmitWithoutReset(formAction)
//   <form onSubmit={submit}>…</form>
//
// Native `required`/type validation still runs first (onSubmit only fires
// for a valid form), isPending still works, and the clicked submit button's
// name/value (e.g. intent=draft vs intent=publish) is still sent.
export function useSubmitWithoutReset(formAction: (formData: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const formData = new FormData(event.currentTarget, submitter)
    startTransition(() => formAction(formData))
  }
}
