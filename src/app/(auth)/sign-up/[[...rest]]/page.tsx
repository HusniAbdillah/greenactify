import { SignUp } from '@clerk/nextjs'
import AuthPageWithImage from '@/components/auth/AuthPage'

export default function Page() {
  return (
    <AuthPageWithImage 
      imageUrl="/images/background.png"
    >
      <SignUp />
    </AuthPageWithImage>
  )
}