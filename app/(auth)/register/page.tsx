import { redirect } from 'next/navigation'

// Google OAuth のみのため、登録とログインは同一フロー
export default function RegisterPage() {
  redirect('/login')
}
