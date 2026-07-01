import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";

type ContactEmailProps = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function ContactEmail({
  name,
  email,
  subject,
  message,
}: ContactEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New contact message from {name}</Preview>

      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://learnova-ruby.vercel.app/Aventra-logo.png"
              width="120"
              alt="Aventra"
              style={logo}
            />

            <Text style={badge}>New Contact Message</Text>
          </Section>

          <Section style={hero}>
            <Heading style={heading}>Someone contacted Aventra</Heading>
            <Text style={description}>
              You received a new message from the Aventra contact page.
            </Text>
          </Section>

          <Section style={card}>
            <Text style={label}>Name</Text>
            <Text style={value}>{name}</Text>

            <Hr style={divider} />

            <Text style={label}>Email</Text>
            <Text style={value}>{email}</Text>

            <Hr style={divider} />

            <Text style={label}>Subject</Text>
            <Text style={value}>{subject}</Text>

            <Hr style={divider} />

            <Text style={label}>Message</Text>
            <Text style={messageBox}>{message}</Text>
          </Section>

          <Text style={footer}>
            This email was sent from Aventra Contact Page.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  margin: "0",
  padding: "0",
  backgroundColor: "#f8fbff",
  fontFamily:
    "Inter, Cairo, -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif",
};

const container = {
  width: "100%",
  maxWidth: "640px",
  margin: "0 auto",
  padding: "32px 20px",
};

const header = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5edf8",
  borderRadius: "24px",
  padding: "22px",
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto 14px",
};

const badge = {
  display: "inline-block",
  margin: "0",
  padding: "8px 14px",
  borderRadius: "999px",
  backgroundColor: "#eaf3ff",
  color: "#1d4ed8",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
};

const hero = {
  marginTop: "18px",
  padding: "30px",
  borderRadius: "28px",
  background: "linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)",
  color: "#ffffff",
};

const heading = {
  margin: "0",
  color: "#ffffff",
  fontSize: "30px",
  lineHeight: "1.2",
  fontWeight: "800",
};

const description = {
  margin: "14px 0 0",
  color: "#e0f2fe",
  fontSize: "15px",
  lineHeight: "1.7",
};

const card = {
  marginTop: "18px",
  padding: "26px",
  borderRadius: "24px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5edf8",
};

const label = {
  margin: "0 0 6px",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

const value = {
  margin: "0",
  color: "#0f172a",
  fontSize: "16px",
  fontWeight: "700",
};

const messageBox = {
  margin: "0",
  padding: "16px",
  borderRadius: "18px",
  backgroundColor: "#f8fbff",
  color: "#334155",
  fontSize: "15px",
  lineHeight: "1.8",
  whiteSpace: "pre-line" as const,
};

const divider = {
  borderColor: "#e5edf8",
  margin: "18px 0",
};

const footer = {
  margin: "22px 0 0",
  textAlign: "center" as const,
  color: "#94a3b8",
  fontSize: "13px",
};