"use client";

import Link from "next/link";

import { routes } from "@/config/routes";
import { useLanding } from "@/features/marketing/context/landing-context";
import {
  FIND_PRICING,
  HIRE_PRICING,
  type PricingPlan,
} from "@/features/marketing/i18n/pricing-data";
import { IconArrowLeft, IconInfo, IconPlanCheck } from "./icons";
import { SideToggle } from "./side-toggle";
import styles from "./landing.module.css";

function PlanCard({
  plan,
  onChoose,
}: {
  plan: PricingPlan;
  onChoose: () => void;
}) {
  return (
    <div
      className={
        plan.featured ? `${styles.plan} ${styles.featured}` : styles.plan
      }
    >
      {plan.tag ? <span className={styles.tag}>{plan.tag}</span> : null}
      <div className={styles.pname}>{plan.name}</div>
      <div className={styles.pdesc}>{plan.desc}</div>
      <div className={styles.price}>
        <span className={styles.amt}>{plan.amount}</span>
        <span className={styles.per}>{plan.per}</span>
      </div>
      <div className={styles.planMeta}>{plan.meta}</div>
      <ul className={styles.pfeat}>
        {plan.features.map((feature) => (
          <li key={feature}>
            <IconPlanCheck />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={`${styles.btn} ${plan.featured ? styles.btnPrimary : styles.btnSecondary}`}
        onClick={onChoose}
      >
        {plan.cta}
      </button>
    </div>
  );
}

/**
 * Worker-first MVP: employer pricing is hidden behind a "coming soon" notice.
 * Flip to true to restore the full hire plans below — nothing was deleted.
 */
const HIRING_PRICING_OPEN = false;

/** Pricing page — find/hire plans, ported pixel-for-pixel from the prototype. */
export function PricingView() {
  const { side, openAuth, copy } = useLanding();

  return (
    <section className={styles.secPad}>
      <div className={styles.wrap}>
        <Link
          href={routes.home}
          className={styles.pageBack}
          aria-label="Go back"
        >
          <IconArrowLeft />
        </Link>

        <div className={styles.priceSwitch}>
          <SideToggle variant="nav" icons={false} />
        </div>

        {side === "find" ? (
          <div>
            <div className={styles.priceGroupHead}>
              <p>{FIND_PRICING.lead}</p>
            </div>
            <div className={styles.plans}>
              {FIND_PRICING.plans.map((plan) => (
                <PlanCard
                  key={plan.name}
                  plan={plan}
                  onChoose={() => openAuth("")}
                />
              ))}
            </div>
            <div className={styles.priceFineprint}>
              {FIND_PRICING.fineprint.map((line) => (
                <div key={line} className={styles.fp}>
                  <IconInfo />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        ) : !HIRING_PRICING_OPEN ? (
          <div className={styles.hireSoon}>
            <span className={styles.authSoonBadge}>{copy.ui.soonBadge}</span>
            <h3>{copy.ui.hireSoonTitle}</h3>
            <p>{copy.ui.hireSoonBody}</p>
          </div>
        ) : (
          <div>
            <div className={styles.priceGroupHead}>
              <p>{HIRE_PRICING.lead}</p>
            </div>
            {HIRE_PRICING.groups.map((group, index) => (
              <div key={group.subhead}>
                <div
                  className={
                    index > 0
                      ? `${styles.priceSubhead} ${styles.mt}`
                      : styles.priceSubhead
                  }
                >
                  {group.subhead}
                  {group.badge ? <span>{group.badge}</span> : null}
                </div>
                <div className={styles.plans2}>
                  {group.plans.map((plan) => (
                    <PlanCard
                      key={plan.name}
                      plan={plan}
                      onChoose={() => openAuth("")}
                    />
                  ))}
                </div>
                {group.note ? (
                  <p className={styles.paygNote}>{group.note}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
