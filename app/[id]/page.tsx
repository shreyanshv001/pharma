

import InstrumentDetailClient from "./InstrumentDetailClient";

export default function Page({ params }: { params: { id: string } }) {
  return <InstrumentDetailClient instrumentId={params.id} />;
}
