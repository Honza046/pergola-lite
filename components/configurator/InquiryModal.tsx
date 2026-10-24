"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfigPreview } from "@/components/configurator/ConfigPreview";
import { buildInquirySummary } from "@/lib/inquiry";
import { useConfig } from "@/lib/store";

const fieldClass =
  "h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-ink outline-none focus:border-forest";

export function InquiryModal({ onClose }: { onClose: () => void }) {
  const config = useConfig();
  const summary = useMemo(() => buildInquirySummary(config), [config]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [consent, setConsent] = useState(false);

  // Lock page scroll + kill rubber-band while modal is open
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !zip.trim() ||
      !city.trim()
    ) {
      setError("Vyplňte kontakt i adresu (ulice, PSČ, město).");
      return;
    }
    if (!consent) {
      setError("Potvrďte souhlas se zpracováním osobních údajů.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          zip: zip.trim(),
          city: city.trim(),
          note: note.trim() || undefined,
          summary,
          config,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Odeslání se nepovedlo.");
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Odeslání se nepovedlo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overscroll-none bg-black/45 p-3 sm:p-5">
      <div
        className="absolute inset-0 overscroll-none"
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        role="presentation"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-[900px] flex-col overflow-hidden overscroll-none rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-2.5">
          <h3 className="text-sm font-semibold text-ink">Poptávka z 3D konfigurátoru</h3>
          <button
            type="button"
            aria-label="Zavřít"
            onClick={onClose}
            className="grid size-7 place-items-center rounded-md text-lg leading-none text-muted hover:bg-black/5"
          >
            ×
          </button>
        </div>

        {done ? (
          <div className="space-y-4 p-6">
            <p className="text-sm font-semibold text-ink">Děkujeme, poptávka je odeslaná.</p>
            <p className="text-[13px] leading-snug text-muted">
              Ozveme se vám s nabídkou podle zvolené specifikace.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-md bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-deep"
            >
              Zavřít
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-col overflow-hidden">
            <div className="grid min-h-0 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:overflow-hidden">
              <div className="flex flex-col border-b border-line bg-[#f7f7f5] lg:border-r lg:border-b-0">
                <div className="relative h-[260px] shrink-0 overflow-hidden sm:h-[300px] lg:h-[340px]">
                  <ConfigPreview />
                </div>
                <div className="shrink-0 border-t border-line px-3 py-2">
                  <p className="mb-1 text-[10px] font-semibold tracking-wide text-muted uppercase">
                    Specifikace
                  </p>
                  <ul className="columns-1 gap-x-4 text-[11px] leading-[1.35] text-ink sm:columns-2">
                    {summary.map((line) => (
                      <li key={line} className="break-inside-avoid">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="overflow-y-auto px-3 pt-3 pb-2 sm:px-4 sm:pt-3">
                <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Kontaktní osoba
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-0.5 block text-[12px] font-medium text-ink">
                      Křestní jméno
                    </span>
                    <input
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={fieldClass}
                      autoComplete="given-name"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[12px] font-medium text-ink">Příjmení</span>
                    <input
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={fieldClass}
                      autoComplete="family-name"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[12px] font-medium text-ink">E-mail</span>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldClass}
                      autoComplete="email"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[12px] font-medium text-ink">Telefon</span>
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={fieldClass}
                      autoComplete="tel"
                    />
                  </label>
                </div>

                <p className="mt-3 mb-1.5 text-[11px] font-semibold tracking-wide text-muted uppercase">
                  Adresa realizace
                </p>
                <div className="grid gap-2">
                  <label className="block">
                    <span className="mb-0.5 block text-[12px] font-medium text-ink">
                      Ulice a číslo
                    </span>
                    <input
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={fieldClass}
                      autoComplete="street-address"
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-[110px_1fr]">
                    <label className="block">
                      <span className="mb-0.5 block text-[12px] font-medium text-ink">PSČ</span>
                      <input
                        required
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className={fieldClass}
                        autoComplete="postal-code"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-0.5 block text-[12px] font-medium text-ink">Město</span>
                      <input
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={fieldClass}
                        autoComplete="address-level2"
                      />
                    </label>
                  </div>
                </div>

                <label className="mt-3 block shrink-0">
                  <span className="mb-0.5 block text-[12px] font-medium text-ink">
                    Poznámka <span className="font-normal text-muted">(volitelné)</span>
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="h-12 w-full resize-y rounded-md border border-line bg-white px-3 py-1.5 text-sm text-ink outline-none focus:border-forest"
                  />
                </label>

                <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[12px] leading-snug text-muted">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0 rounded border-line accent-[var(--forest)]"
                  />
                  <span>
                    Souhlasím se zpracováním osobních údajů za účelem zpracování této poptávky.
                    (Ukázka konfigurátoru, data se neodesílají na server.)
                  </span>
                </label>

                {error ? <p className="mt-2 shrink-0 text-[12px] text-red-700">{error}</p> : null}
              </div>
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-line px-4 py-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 rounded-md bg-[#ececec] px-3.5 text-sm font-medium text-ink hover:bg-[#e2e2e2]"
              >
                Zrušit
              </button>
              <button
                type="submit"
                disabled={busy || !consent}
                className="h-9 rounded-md bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-deep disabled:opacity-60"
              >
                {busy ? "Odesílám…" : "Odeslat poptávku"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
