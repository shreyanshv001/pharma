import InstrumentDetailClient from "./InstrumentDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const instrumentId = id;

  // optionally fetch data here if needed
  return <InstrumentDetailClient instrumentId={instrumentId} />;
}
