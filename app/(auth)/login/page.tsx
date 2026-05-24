import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Props = {
  searchParams: Promise<{ error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_code: '認証コードが見つかりませんでした。もう一度お試しください。',
  auth_error: '認証に失敗しました。もう一度お試しください。',
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">LifeCEO</CardTitle>
          <CardDescription>経営思考で人生を設計する</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && (
            <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {ERROR_MESSAGES[error] ?? 'エラーが発生しました。'}
            </p>
          )}
          <GoogleSignInButton />
          <p className="text-center text-xs text-zinc-500">
            ログインすることで
            <a href="/terms" className="underline underline-offset-2">利用規約</a>
            および
            <a href="/privacy" className="underline underline-offset-2">プライバシーポリシー</a>
            に同意したものとみなします。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
