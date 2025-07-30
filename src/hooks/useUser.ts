import { useUser as useClerkUser } from '@clerk/nextjs'

export function useUser() {
  return useClerkUser()
}