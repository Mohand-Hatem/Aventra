"use client";

import { useCvDetails } from "@/hooks/useCv";
import { type CandidateResult } from "@/types/company";

interface SkillsDialogContentProps {
  candidate: CandidateResult;
}

export function SkillsDialogContent({ candidate }: SkillsDialogContentProps) {
  const { data, isLoading, isError } = useCvDetails(candidate.cvId);

  // Use detailed data if available, fallback to candidate object
  const parsedData = data?.data?.parsedData;
  const technicalSkills = parsedData?.skills?.technical || candidate.technicalSkills || [];
  const softSkills = parsedData?.skills?.soft || candidate.softSkills || [];
  const allSkills = candidate.skills || [];

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-4 text-center text-sm text-red-500">
        Failed to load detailed skills.
      </div>
    );
  }

  return (
    <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2 text-left">
      {technicalSkills && technicalSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground border-b border-border/50 pb-1">
            Technical Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {technicalSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary dark:bg-sky/10 dark:border-sky/20 dark:text-sky"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {softSkills && softSkills.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground border-b border-border/50 pb-1">
            Soft Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-secondary border border-border/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {(!technicalSkills?.length && !softSkills?.length) && (
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground border-b border-border/50 pb-1">
            All Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary dark:bg-sky/10 dark:border-sky/20 dark:text-sky"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
