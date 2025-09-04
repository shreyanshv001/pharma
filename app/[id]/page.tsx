import InstrumentDetailClient from "./InstrumentDetailClient";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  // Pass the id down to the client component
  return <InstrumentDetailClient instrumentId={params.id} />;
}
