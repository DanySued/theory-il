export default function ResultsPage({ params }: { params: { id: string } }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <h1 className="text-3xl font-bold mb-4">תוצאות המבחן</h1>
      <p className="text-[var(--th-muted)]">בקרוב — {params.id}</p>
    </main>
  );
}
