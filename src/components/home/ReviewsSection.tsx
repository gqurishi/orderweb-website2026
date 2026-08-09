import { useState } from "react";
import { Quote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Review = {
  quote: string;
  detail: string;
  who: string;
  place: string;
};

const REVIEWS: Review[] = [
  {
    quote:
      "We cut £2,800 a month in delivery commission and the kitchen is calmer than it has ever been.",
    detail:
      "Before OrderWeb we were losing a fortune to marketplace fees. Moving ordering in-house paid for itself in weeks, and the kitchen display keeps tickets clear even on Friday nights.",
    who: "Sana R.",
    place: "Hilltop Kitchen, Leeds",
  },
  {
    quote:
      "Our own app launched in six weeks. Repeat orders are up 34% since loyalty went live.",
    detail:
      "We wanted something that felt like our brand, not a white-label clone. Loyalty and push notifications brought regulars back without another commission cut.",
    who: "Marco D.",
    place: "Trattoria No.9, Bristol",
  },
  {
    quote:
      "One team handled the POS rollout and our booking integration. No finger-pointing.",
    detail:
      "We run three sites. OrderWeb connected the floor, online and reservations so managers see one picture of the night — and support actually answers the phone.",
    who: "Ellie T.",
    place: "Two Bridges Group",
  },
  {
    quote:
      "Table turnover improved in the first fortnight. Staff picked up OrderWeb faster than any till we have used.",
    detail:
      "Training took an afternoon. Split bills, modifiers and table moves just work — which means more covers without more stress on the floor.",
    who: "Priya K.",
    place: "Harbour & Thyme, Brighton",
  },
  {
    quote:
      "Online orders, bookings and the counter finally sit in one place. Our Friday nights stopped being chaos.",
    detail:
      "We used to juggle three tablets. Now everything lands in OrderWeb, the kitchen stays in sync, and we can actually talk to guests again.",
    who: "James L.",
    place: "Oak & Ember, Manchester",
  },
];

function ReviewCard({
  review,
  onOpen,
}: {
  review: Review;
  onOpen: (review: Review) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(review)}
      className="surface-panel group flex w-[min(78vw,300px)] shrink-0 cursor-pointer flex-col p-5 text-left transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[var(--shadow-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.99] sm:w-[360px] sm:p-7"
    >
      <Quote className="size-4 text-primary transition-transform duration-500 group-hover:scale-110" />
      <blockquote className="mt-3 text-sm leading-relaxed sm:mt-4">{review.quote}</blockquote>
      <p className="mt-4 text-xs text-muted-foreground sm:mt-5">
        {review.who} — {review.place}
      </p>
      <span className="mt-3 text-xs font-medium text-primary opacity-100 transition-opacity duration-300 sm:mt-4 sm:opacity-0 sm:group-hover:opacity-100">
        Read full review →
      </span>
    </button>
  );
}

/** Slow auto-scrolling reviews — click any card to open the full story. */
export function ReviewsSection() {
  const [active, setActive] = useState<Review | null>(null);
  const loop = [...REVIEWS, ...REVIEWS];

  return (
    <>
      <div className="marquee-mask relative -mx-4 overflow-hidden sm:-mx-5">
        <div
          className="flex w-max gap-5 animate-marquee-x py-1 hover:[animation-play-state:paused]"
          style={{
            animationDuration: "90s",
            animationPlayState: active ? "paused" : undefined,
          }}
        >
          {loop.map((t, i) => (
            <ReviewCard key={`${t.who}-${i}`} review={t} onOpen={setActive} />
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-h-[min(88vh,720px)] max-w-xl gap-0 overflow-y-auto border-border/80 p-0 sm:rounded-2xl">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background px-5 pb-7 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
            <Quote className="size-7 text-primary/80 sm:size-8" />
            <DialogHeader className="mt-4 space-y-3 text-left sm:mt-5 sm:space-y-4">
              <DialogTitle className="font-serif text-xl font-normal leading-snug sm:text-3xl">
                {active?.quote}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed text-foreground/70 sm:text-base">
                {active?.detail}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 border-t border-border/70 pt-4 sm:mt-8 sm:pt-5">
              <p className="text-sm font-medium text-foreground">{active?.who}</p>
              <p className="mt-1 text-sm text-muted-foreground">{active?.place}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
