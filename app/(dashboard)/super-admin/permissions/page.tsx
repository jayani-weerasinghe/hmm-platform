import { createClient } from '@/lib/supabase/server'
import { RoleDefaultToggle } from './role-default-toggle'

export default async function RoleDefaultsPage() {
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('permissions')
    .select('role, permission, is_enabled')

  const permissionKeys = Array.from(new Set((rows ?? []).map(r => r.permission))).sort()

  const lookup: Record<string, Record<string, boolean>> = {}
  for (const row of rows ?? []) {
    lookup[row.permission] ??= {}
    lookup[row.permission][row.role] = row.is_enabled
  }

  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">
        These are the baseline permissions every Champion or Gatekeeper has, unless a Group or
        Individual Exception overrides them.
      </p>

      <div className="overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
        {permissionKeys.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">No permissions configured yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className="px-6 py-3">Permission</th>
                <th className="px-6 py-3 text-center">Champion</th>
                <th className="px-6 py-3 text-center">Gatekeeper</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissionKeys.map(key => (
                <tr key={key}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{key}</td>
                  <td className="px-6 py-4 text-center">
                    <RoleDefaultToggle
                      role="champion"
                      permission={key}
                      initialEnabled={lookup[key]?.champion ?? false}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <RoleDefaultToggle
                      role="gatekeeper"
                      permission={key}
                      initialEnabled={lookup[key]?.gatekeeper ?? false}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
