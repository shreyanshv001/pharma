import InstrumentDetailClient from "./InstrumentDetailClient";


interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const instrumentId = params.id;

  // optionally fetch data here if needed
  return <InstrumentDetailClient instrumentId={instrumentId} />;
}
