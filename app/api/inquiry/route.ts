import { NextResponse } from "next/server";

import type { InquiryPayload } from "@/lib/inquiry";

export async function POST(request: Request) {
  let body: InquiryPayload;
  try {
    body = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ error: "Neplatná data." }, { status: 400 });
  }

  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const address = body.address?.trim() ?? "";
  const zip = body.zip?.trim() ?? "";
  const city = body.city?.trim() ?? "";

  if (!firstName || !lastName || !email || !phone || !address || !zip || !city) {
    return NextResponse.json(
      { error: "Vyplňte kontakt i adresu (ulice, PSČ, město)." },
      { status: 400 },
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Neplatný e-mail." }, { status: 400 });
  }

  console.info("[inquiry]", {
    firstName,
    lastName,
    email,
    phone,
    address,
    zip,
    city,
    note: body.note ?? null,
    summary: body.summary,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
