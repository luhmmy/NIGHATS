"use client";

import Link from "next/link";
import { useActionState } from "react";
import { LandingNav } from "../landing-nav";
import { submitContact, type ContactState } from "./actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: ContactState = {};

export default function ContactPage() {
  const [state, formAction] = useActionState(submitContact, initialState);

  return (
    <div className="min-h-screen bg-void text-fg flex flex-col justify-between">
      <LandingNav />

      <main className="mx-auto w-full max-w-4xl px-4 py-16 md:px-12 flex-1">
        <div className="mb-8">
          <div className="mono-caps text-primary">{"// SECURE TRANSMISSION CHANNEL"}</div>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-bold text-fg-strong md:text-5xl uppercase tracking-tight">
            Contact &amp; <span className="text-primary">Support</span>
          </h1>
          <p className="mt-3 font-[family-name:var(--font-body)] text-sm text-fg-dim max-w-2xl leading-relaxed">
            Direct your inquiry to the appropriate organizing unit. Messages are encrypted, logged in our operational queue, and dispatched to festival leads.
          </p>
        </div>

        <div className="rounded-3xl border border-line/80 bg-surface/90 p-6 sm:p-8 shadow-xl backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-line/70 pb-4 mb-6 text-xs font-[family-name:var(--font-mono)] text-fg-muted">
            <span className="text-fg-strong font-medium text-sm">Official Inquiry Form</span>
            <span className="text-primary font-medium">Direct Organizing Comms</span>
          </div>

          {state.ok ? (
            <div className="rounded-lg border border-primary/40 bg-primary/10 p-8 text-center space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-fg-strong">
                Transmission Received
              </h2>
              <p className="font-[family-name:var(--font-body)] text-sm text-fg-dim max-w-md mx-auto">
                Your message has been queued for review. Our organizing committee will respond to your specified comms address.
              </p>
              {state.ticketId && (
                <div className="inline-block rounded bg-void px-4 py-2 font-[family-name:var(--font-mono)] text-xs text-secondary border border-line">
                  TICKET_REF: {state.ticketId}
                </div>
              )}
              <div className="pt-4">
                <Link
                  href="/"
                  className="rounded bg-primary px-6 py-2.5 font-[family-name:var(--font-mono)] text-xs font-semibold uppercase tracking-wide text-on-primary hover:bg-primary-bright transition-all"
                >
                  Return to Main Portal
                </Link>
              </div>
            </div>
          ) : (
            <form action={formAction} className="space-y-6">
              {state.error && (
                <div className="rounded border border-danger/40 bg-danger/10 p-3 font-[family-name:var(--font-mono)] text-xs text-danger">
                  [!] ERROR: {state.error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="mono-caps mb-2 block text-fg-dim">
                    Operator / Full Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Adebayo Ogunlesi / @shadow_0x"
                    className="w-full rounded border border-line-bright bg-void px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mono-caps mb-2 block text-fg-dim">
                    Secure Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="operator@security.ng"
                    className="w-full rounded border border-line-bright bg-void px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="category" className="mono-caps mb-2 block text-fg-dim">
                    Inquiry Routing Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    defaultValue="GENERAL"
                    className="w-full rounded border border-line-bright bg-void px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong focus:border-primary focus:outline-none"
                  >
                    <option value="GENERAL">General Inquiries &amp; Information</option>
                    <option value="SPONSOR">Sponsorship &amp; Partnerships</option>
                    <option value="SPEAKER">CFP &amp; Speaker Research Submissions</option>
                    <option value="VILLAGE">Hacking Village &amp; Lab Proposals</option>
                    <option value="VOLUNTEER">Organizing Crew &amp; Volunteer Opportunities</option>
                    <option value="MEDIA">Press &amp; Media Accreditation</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="subject" className="mono-caps mb-2 block text-fg-dim">
                    Subject Line
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    placeholder="Brief description of inquiry"
                    className="w-full rounded border border-line-bright bg-void px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="mono-caps mb-2 block text-fg-dim">
                  Detailed Transmission *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  placeholder="State your technical proposal, question, or organization details clearly..."
                  className="w-full rounded border border-line-bright bg-void px-3 py-2.5 font-[family-name:var(--font-mono)] text-sm text-fg-strong placeholder:text-fg-muted focus:border-primary focus:outline-none"
                />
              </div>

              <div className="rounded bg-surface-2 p-3 font-[family-name:var(--font-mono)] text-[11px] text-fg-muted border border-line">
                <span className="text-primary font-bold">NOTE:</span> Event planning is actively in progress. Specific dates and venue in Lagos will be officially confirmed via cryptographic dispatch.
              </div>

              <SubmitButton
                variant="primary"
                pendingLabel="Encrypting & Transmitting..."
                className="w-full py-3.5"
              >
                Transmit Message
              </SubmitButton>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-line py-8 bg-surface-2/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 md:px-12 text-xs font-[family-name:var(--font-mono)] text-fg-muted">
          <p>© 2027 NIGHATS 1.0 • Nigerian Hacker Festival</p>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <Link href="/contact" className="hover:text-primary text-primary transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
