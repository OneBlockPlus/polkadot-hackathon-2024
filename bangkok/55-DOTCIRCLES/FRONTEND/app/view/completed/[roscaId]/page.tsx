export default async function CompletedRosca({
  params,
}: {
  params: { roscaId: string };
}) {
  return <div>My Post: {params.roscaId}</div>;
}
