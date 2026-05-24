type Props = {
  params: Promise<{ id: string }>
}

export default async function GoalDetailPage({ params }: Props) {
  const { id } = await params
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">目標詳細: {id}</h1>
    </div>
  )
}
