import { RegisterForm } from '@/components/auth/register-form';
import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Link href="/" className="flex justify-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">SalesScope</h1>
        </Link>
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
