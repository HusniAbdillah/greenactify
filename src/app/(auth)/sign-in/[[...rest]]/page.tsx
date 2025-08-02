import { SignIn } from '@clerk/nextjs'
import AuthPageWithImage from '@/components/auth/AuthPage'

export default function Page() {
  return (
    <AuthPageWithImage 
      imageUrl="/background.png"
    >
      <SignIn />
    </AuthPageWithImage>
  )
}