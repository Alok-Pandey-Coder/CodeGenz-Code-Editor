import LoginFormClient from '@/modules/auth/components/login-form-client'
import Image from 'next/image'

function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-20 px-6 py-12">
      <Image
        src="/login.svg"
        alt="Login illustration"
        height={480}
        width={480}
        className="hidden object-contain lg:block"
      />
      <div className="w-full max-w-lg">
        <LoginFormClient />
      </div>
    </div>
  )
}

export default Page