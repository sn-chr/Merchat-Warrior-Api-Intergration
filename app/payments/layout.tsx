
export default function PaymentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background justify-center items-center">
      <main>
        {children}
      </main>
    </div>
  )
} 