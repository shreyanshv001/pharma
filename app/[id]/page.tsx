import InstrumentDetailClient from "./InstrumentDetailClient";

// In app/experiment/[id]/page.tsx
export default async function Page(props: PageProps<'/experiment/[id]'>) {
  const { id } = await props.params;
  return <InstrumentDetailClient instrumentId={id} />;
}
