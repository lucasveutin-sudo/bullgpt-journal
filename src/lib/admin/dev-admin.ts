import { cookies } from 'next/headers'

export const DEV_ADMIN_COOKIE = 'bullgpt_dev_admin'

export async function hasDevAdminCookie(): Promise<boolean> {
  const store = await cookies()
  return store.get(DEV_ADMIN_COOKIE)?.value === '1'
}
