import InstrumentDetailClient from "./InstrumentDetailClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // Now use the id as needed
  return <InstrumentDetailClient instrumentId={id} />;
}
