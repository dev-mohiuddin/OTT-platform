import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "What is Dristy OTT?",
    a: "Dristy is a premium streaming platform for Bangla and global entertainment with personalized recommendations and multi-device sync.",
  },
  {
    q: "What subscription plans are available?",
    a: "Flexible monthly plans start from ৳99, with options for students, families, and ad-free premium streaming.",
  },
  {
    q: "Can I download content for offline viewing?",
    a: "Yes. Premium and Family tiers can download supported movies and shows to watch without internet connection.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "You can cancel anytime from account settings. Your plan stays active until the end of the current billing cycle.",
  },
  {
    q: "Can I share my account with family members?",
    a: "Yes. Dristy supports up to six profiles with watch history, recommendations, and parental controls managed separately.",
  },
  {
    q: "How do I report an issue with the platform?",
    a: "Use in-app support or the help center to submit playback, billing, or account issues with priority tracking.",
  },
  {
    q: "What if I forget my password?",
    a: "Use the forgot password flow from sign in. You will receive a secure reset link to your registered email.",
  },
  {
    q: "How can I create a Fan Art creator profile?",
    a: "Apply from your account once community features are enabled; selected creators receive publishing and spotlight access.",
  },
];

const leftFaqs = faqs.filter((_, index) => index % 2 === 0);
const rightFaqs = faqs.filter((_, index) => index % 2 === 1);

function FaqColumn({
  items,
  columnId,
}: {
  items: typeof faqs;
  columnId: string;
}) {
  return (
    <Accordion className="w-full space-y-3" defaultValue={items.length > 0 ? [`${columnId}-0`] : []}>
      {items.map((item, index) => (
        <AccordionItem
          key={`${columnId}-${item.q}`}
          value={`${columnId}-${index}`}
          className="rounded-xl border border-ott-border-soft bg-white/80 px-4 py-1.5 backdrop-blur-sm dark:border-white/14 dark:bg-white/5"
        >
          <AccordionTrigger className="text-left text-sm font-medium text-ott-text-primary sm:text-base dark:text-white">{item.q}</AccordionTrigger>
          <AccordionContent className="text-sm text-ott-text-secondary">{item.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="ott-section pb-16 sm:pb-20">
      <div className="ott-shell space-y-7">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.16em] text-ott-text-muted">Help center</p>
          <h2 className="font-heading text-3xl font-semibold text-ott-text-primary sm:text-4xl dark:text-white">Frequently asked questions</h2>
          <p className="mx-auto max-w-2xl text-ott-text-secondary">
            Everything you need to know before starting your first stream.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          <FaqColumn items={leftFaqs} columnId="left" />
          <FaqColumn items={rightFaqs} columnId="right" />
        </div>

        <div className="flex justify-center">
          <Link
            href="/sign-in"
            className={cn(
              buttonVariants({ size: "sm" }),
              "ott-gradient-cta h-8 rounded-md px-4 text-xs font-medium text-white",
            )}
          >
            <MessageCircleQuestion className="size-4" />
            Ask a Question
          </Link>
        </div>
      </div>
    </section>
  );
}