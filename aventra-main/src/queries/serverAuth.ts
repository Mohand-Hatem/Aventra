import { cookies } from "next/headers";

export async function getUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.BASE_URL}/users/me`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
