import {
  CardBlock,
  EditorPart,
  TextField,
} from "@/components/admin/Field";
import { ImageReplaceField } from "@/components/admin/ImageReplaceField";
import { siteMedia } from "@/lib/cms/siteMediaUrls";
import type { ContactContent } from "@/lib/cms/types";

const PARTS = [
  { part: 1, title: "Hero" },
  { part: 2, title: "Contact details" },
  { part: 3, title: "Message form" },
] as const;

export function ContactEditor({
  value,
  onChange,
}: {
  value: ContactContent;
  onChange: (v: ContactContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#61c3ec]/25 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(47,111,184,0.35)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2f6fb8]">
          Contact page map
        </p>
        <p className="mt-1 text-sm text-[#5b6b7c]">
          Matches the live /contact page. Open one part, edit, then Save draft → Preview → Publish.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PARTS.map((p) => (
            <a
              key={p.part}
              href={`#editor-part-${p.part}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#61c3ec]/35 bg-[#f3f9fc] px-3 py-1.5 text-sm font-medium text-[#0a1a4a] transition hover:border-[#2f6fb8] hover:bg-white"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f6fb8] text-[10px] font-semibold text-white">
                {p.part}
              </span>
              {p.title}
            </a>
          ))}
        </div>
        <p className="mt-4 rounded-xl bg-[#f3f9fc] px-3 py-2 text-xs text-[#5b6b7c] ring-1 ring-[#61c3ec]/20">
          Where messages are delivered (SMTP inbox) is set in{" "}
          <strong className="font-semibold text-[#0a1a4a]">Settings</strong> — not on this page.
          Part 2 email is what visitors see and can click on the public Contact page.
        </p>
      </div>

      <EditorPart
        part={1}
        title="Hero"
        summary="Top of Contact — label, headline, short intro, and the London illustration."
        defaultOpen
      >
        <TextField
          label="Small label"
          value={value.hero.eyebrow}
          onChange={(eyebrow) => onChange({ ...value, hero: { ...value.hero, eyebrow } })}
          hint='Example: "Contact"'
        />
        <TextField
          label="Main headline"
          value={value.hero.headline}
          onChange={(headline) => onChange({ ...value, hero: { ...value.hero, headline } })}
          hint="Invite action — under ~60 characters"
          maxLength={80}
          required
        />
        <TextField
          label="Short supporting line"
          value={value.hero.body}
          onChange={(body) => onChange({ ...value, hero: { ...value.hero, body } })}
          multiline
        />
        <ImageReplaceField
          label="Hero picture"
          value={value.hero.image}
          onChange={(image) => onChange({ ...value, hero: { ...value.hero, image } })}
          fallbackSrc={siteMedia.contactLondon}
          hint="Right-side illustration on Contact. Click Replace picture to upload — no URL needed."
          folder="contact"
        />
      </EditorPart>

      <EditorPart
        part={2}
        title="Contact details"
        summary="Company card + email, phone, and address shown beside the form."
      >
        <CardBlock label="Company card">
          <TextField
            label="Company name"
            value={value.display.companyName}
            onChange={(companyName) =>
              onChange({ ...value, display: { ...value.display, companyName } })
            }
          />
          <TextField
            label="Short blurb under the name"
            value={value.display.companyBlurb}
            onChange={(companyBlurb) =>
              onChange({ ...value, display: { ...value.display, companyBlurb } })
            }
            multiline
            hint='Example: "Software company & specialised POS platform"'
          />
        </CardBlock>

        <CardBlock
          label="Clickable contact rows"
          hint="These appear on the public page. Email opens mail; phone opens the dialler."
        >
          <TextField
            label="Email shown on page"
            value={value.display.email}
            onChange={(email) =>
              onChange({ ...value, display: { ...value.display, email } })
            }
            hint="Usually mail@orderweb.co.uk"
          />
          <TextField
            label="Phone shown on page"
            value={value.display.phone}
            onChange={(phone) =>
              onChange({ ...value, display: { ...value.display, phone } })
            }
            hint='Example: "+44 20 4620 5678"'
          />
          <TextField
            label="Address shown on page"
            value={value.display.address}
            onChange={(address) =>
              onChange({ ...value, display: { ...value.display, address } })
            }
            hint='Example: "Brockley, London, UK"'
          />
        </CardBlock>

        <TextField
          label="Demo note (under the details)"
          value={value.display.demoNote}
          onChange={(demoNote) =>
            onChange({ ...value, display: { ...value.display, demoNote } })
          }
          multiline
          hint="Optional tip about booking a demo or screen-share"
        />
      </EditorPart>

      <EditorPart
        part={3}
        title="Message form"
        summary="Button label, message box hint, and the thank-you text after someone sends."
      >
        <TextField
          label="Submit button text"
          value={value.form.submitLabel}
          onChange={(submitLabel) =>
            onChange({ ...value, form: { ...value.form, submitLabel } })
          }
          hint='Example: "Send message"'
        />
        <TextField
          label="Message box placeholder"
          value={value.form.messagePlaceholder}
          onChange={(messagePlaceholder) =>
            onChange({ ...value, form: { ...value.form, messagePlaceholder } })
          }
          multiline
          hint="Grey hint text inside the message field before someone types"
        />
        <TextField
          label="Success message after send"
          value={value.form.successMessage}
          onChange={(successMessage) =>
            onChange({ ...value, form: { ...value.form, successMessage } })
          }
          multiline
          hint='Shown under “Message Sent Successfully”. Example: "Thank you for contacting us. A member of our team will get back to you within 2-3 hours."'
        />
        <p className="rounded-xl bg-[#f3f9fc] px-3 py-2 text-xs text-[#5b6b7c] ring-1 ring-[#61c3ec]/20">
          Name, email, company, and phone field labels stay fixed in the layout. To change where
          form emails are delivered, use Admin → Settings.
        </p>
      </EditorPart>
    </div>
  );
}
