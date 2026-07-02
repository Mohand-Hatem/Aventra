import { z } from "zod";

export function createContactSchema(messages: {
  nameMin: string;
  emailInvalid: string;
  subjectRequired: string;
  messageMin: string;
}) {
  return z.object({
    name: z.string().min(2, messages.nameMin),
    email: z.string().email(messages.emailInvalid),
    subject: z.string().min(2, messages.subjectRequired),
    message: z.string().min(10, messages.messageMin),
    website: z.string().optional(),
  });
}

export const contactSchema = createContactSchema({
  nameMin: "Name must be at least 2 characters",
  emailInvalid: "Please enter a valid email",
  subjectRequired: "Subject is required",
  messageMin: "Message must be at least 10 characters",
});

export type ContactSchema = z.infer<typeof contactSchema>;
