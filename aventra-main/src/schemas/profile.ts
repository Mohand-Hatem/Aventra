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
      .instanceof(File)
      .refine((file) => file.type.startsWith("image/"), messages.avatarType)
      .refine((file) => file.size <= MAX_AVATAR_SIZE, messages.avatarSize)
      .optional(),
  });
}

export type UpdateProfileFormValues = z.infer<
  ReturnType<typeof createUpdateProfileSchema>
>;

export type UpdateProfilePayload = {
  name?: LocalizedName;
  avatar?: File;
};
