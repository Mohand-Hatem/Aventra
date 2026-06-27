type CandidateDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CandidateDetailsPage({
  params,
}: CandidateDetailsPageProps) {
  const { id } = await params;

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">
        Candidate {id}
      </h1>
      <p className="mt-2 text-muted-foreground">
        Review candidate analysis, scores, and profile details.
      </p>
    </section>
  );
}
