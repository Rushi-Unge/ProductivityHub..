
import AuthForm from "@/components/auth-form";
import Image from "next/image";

export default function AuthenticationPage() {
  return (
    <main className="min-h-screen flex flex-col lg:flex-row items-stretch justify-center auth-gradient">
      {/* Decorative Image Section (visible on larger screens) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 h-screen items-center justify-center p-8 md:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/30 opacity-50 mix-blend-multiply"></div>
        <Image
          src="https://placehold.co/1200x1800.png" 
          alt="Abstract productivity illustration"
          width={1200}
          height={1800}
          className="object-cover rounded-2xl shadow-2xl max-h-[calc(100vh-4rem)] w-auto h-auto z-10"
          data-ai-hint="abstract productivity concept" 
          priority
        />
      </div>
      {/* Auth Form Section */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-4 md:p-8">
        <AuthForm />
      </div>
    </main>
  );
}
