import InstrumentDetailClient from "./InstrumentDetailClient";

type ParamsPromise = Promise<{ id: string }>;

export default async function Page({ params }: { params: ParamsPromise }) {
  const { id } = await params;
  return <InstrumentDetailClient instrumentId={id} />;
}
