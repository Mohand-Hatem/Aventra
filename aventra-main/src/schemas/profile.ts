import { z } from "zod";
import type { LocalizedName } from "@/types/auth";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function createUpdateProfileSchema(messages: {
  nameMin: string;
  avatarType: string;
  avatarSize: string;
}) {
  return z.object({
    name: z.object({
      en: z.string().trim().min(2, messages.nameMin),
      ar: z.string().trim().min(2, messages.nameMin),
    }),
    avatar: z
      .any()
      .refine((file) => !file || file instanceof File, "Must be a file")
      .refine(
        (file) => !file || (file instanceof File && file.type.startsWith("image/")),
        messages.avatarType,
      )
      .refine(
        (file) => !file || (file instanceof File && file.size <= MAX_AVATAR_SIZE),
        messages.avatarSize,
      )
      .optional()
      .nullable(),
  });
}

export type UpdateProfileFormValues = z.infer<
  ReturnType<typeof createUpdateProfileSchema>
>;

export type UpdateProfilePayload = {
  name?: LocalizedName;
  avatar?: File;
};
