import { redirect } from 'next/navigation';

type ResetPasswordPageProps = {
  searchParams?: { token?: string };
};

export default async function ResetPasswordRedirectPage({ searchParams }: ResetPasswordPageProps) {
  const token = searchParams?.token;
  redirect(token ? `/auth/login?token=${encodeURIComponent(token)}` : '/auth/login');
}
