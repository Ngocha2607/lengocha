"use client";

import { CircleCheck, FileText, Globe, Mail, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { GitHubGlyph, LinkedInGlyph } from "./SocialIcons";

/**
 * The form fields, in the live site's order.
 *
 * PROJECT and BUDGET were dropped on request — the live site asks for both, with
 * a `$5k- $20k` budget placeholder that frames this as agency intake rather than
 * a way to reach a person. Three fields is the whole form now.
 *
 * Two copy details below look like mistakes but are transcribed VERBATIM from
 * the live site — do not "fix" them:
 *   - the first field's `name` really is mixed-case `Name`, while every other
 *     field name is all caps;
 *   - the labels are stored already-uppercase (computed `text-transform` is
 *     `none`), so the rendered element carries no `uppercase` utility either.
 *
 * The live site also emits 11 zero-size honeypot inputs (`website`, `company`,
 * `message`, `subject`, `title`, `description`, `feedback`, `notes`, `details`,
 * `remarks`, `comments`). Those are Framer's form spam protection rather than
 * design, so they are deliberately left out.
 */
const CONTACT_FIELDS = [
  { label: "NAME", name: "Name", type: "text", placeholder: "Your name" },
  { label: "EMAIL", name: "EMAIL", type: "email", placeholder: "you@email.com" },
  {
    label: "MESSAGE",
    name: "MESSAGE",
    type: "textarea",
    placeholder: "Tell me about Your Project",
  },
] as const;

/**
 * Lê Ngọc Hà's real profiles, read off lengocha.vercel.app rather than guessed.
 * The template's originals (Twitter / Dribbble, plus placeholder `https://gitHub.com`
 * and `https://linkedin.com` root URLs) are gone — he has no Twitter or Dribbble.
 */
const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/Ngocha2607", Icon: GitHubGlyph },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/ng%E1%BB%8Dc-h%C3%A0-l%C3%AA-886aa3228/",
    Icon: LinkedInGlyph,
  },
  { label: "Portfolio", href: "https://lengocha.vercel.app", Icon: Globe },
  // "CV" rather than "Résumé": the row is tight and the labels have to fit.
  {
    label: "CV",
    href: "https://lengocha.vercel.app/Le-Ngoc-Ha-Senior-Frontend-Developer.pdf",
    Icon: FileText,
  },
] as const;

/** Every icon in the right column renders at this size. */
const ICON_CLASS = "size-[13px] shrink-0";

/** Shared type/colour of every small grey block label in the right column. */
const BLOCK_LABEL = "font-sans text-[12px] font-normal leading-[16.8px] text-black/60";
/** Shared type/colour of every value in the right column. */
const BLOCK_VALUE =
  "font-display text-[16px] font-normal leading-[22.4px] tracking-[-0.16px] text-black";
/** The measured easing of both slide-on-hover effects: `transform 0.3s ease`. */
const SLIDE_TRANSITION = "transition-transform duration-300 ease-[ease]";

/**
 * Body of the "Contact" window — the chrome comes from `WindowFrame`, which
 * renders `children` flush against the 44px title bar, so the 50px gap down to
 * the container (content starts at y = 94) is supplied here.
 *
 * The measured row is a 533px white form card, a 40px gap and a 251px column of
 * contact details — 824px inside the 864px window. The submit button and every
 * social link hold TWO stacked copies of their label inside a clipped box; on
 * hover the inner column slides up by exactly one step (35px on the button,
 * 24px on the links) so the second copy replaces the first.
 *
 * Submitting is out of scope: there is no backend, so `onSubmit` only calls
 * `preventDefault()`. Native `required` still runs first, so the browser's own
 * validation bubbles are the only validation UI.
 *
 * Below 880px the live site clips rather than reflows; stacking the two columns
 * and stepping the 72px heading down is our own graceful fallback.
 */
export function ContactWindow() {
  return (
    <div className="pt-[50px]">
      {/* Container */}
      <div className="mx-auto flex w-full max-w-[1152px] items-center justify-center px-5 pb-[60px]">
        {/* Content */}
        <div className="flex w-full flex-col items-start gap-[50px]">
          {/* Title & Description — 474px wide, so the heading wraps onto two lines */}
          <div className="flex w-full flex-col items-start gap-3 min-[880px]:w-[474px]">
            {/* 72px / 86.4px / -2.88px is exactly 1.2 line-height and -0.04em
                tracking, so the two smaller steps stay proportional. */}
            <h2 className="font-display text-[40px] font-normal leading-[1.2] tracking-[-0.04em] text-black min-[640px]:text-[56px] min-[880px]:text-[72px]">
              {"Let's talk"}
            </h2>
            <p className="font-display text-[16px] font-normal leading-[22.4px] tracking-[-0.16px] text-black/60">
              Available for remote · Hanoi, Vietnam
            </p>
          </div>

          {/* Form & Contact */}
          <div className="flex w-full flex-col items-start gap-10 min-[880px]:flex-row min-[880px]:justify-center">
            {/* `data-no-drag` keeps typing and clicking inside the card from
                starting a window drag — `WindowFrame` checks for it. */}
            <form
              data-no-drag
              onSubmit={(event) => event.preventDefault()}
              className="flex w-full flex-col items-start gap-8 bg-white p-5 min-[880px]:w-[533px] min-[880px]:shrink-0"
            >
              {/* All Forms */}
              <div className="flex w-full flex-col gap-6">
                {CONTACT_FIELDS.map((field) => (
                  // The 16px label/input gap is what makes the five stacked
                  // fields add up to the measured 478px column height.
                  <label key={field.name} className="flex w-full flex-col items-start gap-4">
                    <p className="font-display text-[14px] font-normal leading-[19.6px] tracking-[-0.14px] text-black">
                      {field.label}
                    </p>
                    {/* The underline is an `::after` on the live site; a bottom
                        border on the wrapper is pixel-identical. The
                        `focus-within` darkening is OUR addition — the live
                        inputs have no visible focus state at all. */}
                    <div
                      className={cn(
                        "relative flex w-full items-center overflow-hidden border-b border-black/10 transition-colors duration-200 focus-within:border-black/40",
                        field.type === "textarea" ? "h-[66px]" : "pb-3",
                      )}
                    >
                      {field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          placeholder={field.placeholder}
                          required
                          className="font-display h-[66px] w-full resize-none rounded-none border-none bg-transparent p-0 text-[16px] font-normal leading-[22.4px] text-black outline-none placeholder:text-black/50"
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          required
                          className="font-display w-full rounded-none border-none bg-transparent p-0 text-[16px] font-normal leading-[22.4px] text-black outline-none placeholder:text-black/50"
                        />
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Submit — two stacked copies 35px apart, clipped down to one. */}
              <button
                type="submit"
                className="group flex h-[41px] w-[191px] shrink-0 cursor-pointer items-center justify-center overflow-clip rounded-[40px] bg-black px-[54px] py-3"
              >
                <span className="flex h-[16.8px] w-full flex-col items-center overflow-clip">
                  <span
                    className={cn(
                      "flex shrink-0 flex-col items-center gap-[18.2px] group-hover:-translate-y-[35px]",
                      SLIDE_TRANSITION,
                    )}
                  >
                    <span className="font-sans text-[12px] font-normal leading-[16.8px] whitespace-nowrap text-white">
                      Send Message
                    </span>
                    <span
                      aria-hidden="true"
                      className="font-sans text-[12px] font-normal leading-[16.8px] whitespace-nowrap text-white"
                    >
                      Send Message
                    </span>
                  </span>
                </span>
              </button>
            </form>

            {/* All Contact Details */}
            <div className="flex w-full flex-col items-start justify-center gap-8 min-[880px]:w-[251px] min-[880px]:shrink-0">
              {/* Email. The icon sits on the value, not the label: the labels are
                  the quiet grey scaffolding, and putting a mark on each of those
                  instead would compete with the values for attention. */}
              <div className="flex flex-col items-start gap-1">
                <p className={BLOCK_LABEL}>EMAIL</p>
                <a
                  data-no-drag
                  href="mailto:ngocha2k0.ln@gmail.com"
                  target="_blank"
                  rel="noreferrer noopener"
                  className={cn(BLOCK_VALUE, "flex items-center gap-2")}
                >
                  <Mail className={ICON_CLASS} aria-hidden="true" />
                  ngocha2k0.ln@gmail.com
                </a>
              </div>

              {/* Location — plain text, not a link. The template pointed at a
                  Google Maps short link for Lisbon; rather than invent an
                  equivalent, this is left as text. */}
              <div className="flex flex-col items-start gap-1">
                <p className={BLOCK_LABEL}>LOCATION</p>
                <p className={cn(BLOCK_VALUE, "flex items-center gap-2")}>
                  <MapPin className={ICON_CLASS} aria-hidden="true" />
                  Hanoi, Vietnam · UTC+7
                </p>
              </div>

              {/* Availability — the green carries the meaning, so it moves from
                  the label's bullet onto the icon and the bullet goes away. */}
              <div className="flex flex-col items-start gap-1">
                <p className={BLOCK_LABEL}>AVAILABILITY</p>
                <p className={cn(BLOCK_VALUE, "flex items-center gap-2")}>
                  <CircleCheck className={cn(ICON_CLASS, "text-os-green")} aria-hidden="true" />
                  Available for remote work
                </p>
              </div>

              {/* Social — keeps the live site's two-copy slide: each label is
                  printed twice in a clipped 22.4px box, and hover shifts the
                  column up exactly one step so the second copy takes its place.
                  The icon sits OUTSIDE that box on purpose, so it stays put while
                  the text travels; inside, it would slide away with the label.

                  Two across rather than the original's single row. With an icon
                  and a gap in front of each, the four labels no longer fit in
                  251px, and a wrapped `justify-between` row spaces its last line
                  differently from its first. A 2x2 grid stays even. */}
              <div className="flex w-full flex-col items-start gap-4">
                <p className={BLOCK_LABEL}>SOCIAL</p>
                <div
                  data-no-drag
                  className="grid w-full max-w-[251px] grid-cols-2 gap-x-4 gap-y-2"
                >
                  {SOCIAL_LINKS.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group/social flex items-center gap-2"
                    >
                      <social.Icon className={ICON_CLASS} />
                      <span className="flex h-[22.4px] overflow-clip">
                        <span
                          className={cn(
                            "flex flex-col items-start gap-[1.6px] group-hover/social:-translate-y-6",
                            SLIDE_TRANSITION,
                          )}
                        >
                          <span className={cn(BLOCK_VALUE, "whitespace-nowrap")}>
                            {social.label}
                          </span>
                          <span aria-hidden="true" className={cn(BLOCK_VALUE, "whitespace-nowrap")}>
                            {social.label}
                          </span>
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
