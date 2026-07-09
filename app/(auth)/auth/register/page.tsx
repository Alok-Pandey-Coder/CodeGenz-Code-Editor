import Register from "@/modules/auth/components/register-form-client";
import Image from "next/image";

const Page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center gap-20 px-6 py-12">
      <Image
        src="/login.svg"
        alt="Login illustration"
        height={480}
        width={480}
        className="hidden object-contain lg:block shrink-0"
      />
      <div className="w-full max-w-lg shrink-0">
        <Register />
      </div>
    </div>
  )
}

export default Page