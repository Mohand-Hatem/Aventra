import type { Metadata } from "next";
import { ContactPage } from "@/components/feature/contact/ContactPage";

export const metadata: Metadata = {
  title: "Contact | Aventra",
  description:
    "Contact Aventra support for candidate assistance, company support, pricing, partnerships, and technical issues.",
};

export default function Page() {
  return <ContactPage />;
}