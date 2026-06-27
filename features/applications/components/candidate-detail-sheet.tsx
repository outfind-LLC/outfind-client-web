"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { routes } from "@/config/routes";
import { useI18n } from "@/providers/i18n-provider";
import { useCandidateDetailStore } from "@/features/applications/store/candidate-detail.store";
import type { CandidateCardData } from "@/features/chat/types/candidate";
import { ChatMark, Ic } from "@/features/dashboard/components/app-icons";
import { cn } from "@/lib/utils";
import s from "@/features/dashboard/styles/peoplor-app.module.css";

/**
 * Employer candidate detail — the prototype's right-side `.jd` sheet for people:
 * source pill, name + verified, role · location, match, salary, facts
 * (location / availability / experience), About, Experience, Skills, and how to
 * reach them. Mounted once in `AppShell`. Mirrors the worker job detail sheet.
 */
export function CandidateDetailSheet() {
  const candidate = useCandidateDetailStore((st) => st.candidate);
  if (!candidate) return null;
  return <Sheet key={candidate.id} candidate={candidate} />;
}

function Sheet({ candidate }: { candidate: CandidateCardData }) {
  const close = useCandidateDetailStore((st) => st.close);
  const { t } = useI18n();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const doClose = useCallback(() => {
    setShow(false);
    window.setTimeout(close, 240);
  }, [close]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") doClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [doClose]);

  const c = candidate;
  const { email, phone } = c.contact;
  const firstName = c.name.split(/\s+/)[0];

  const facts = [];
  if (c.location)
    facts.push(
      <span key="loc" className={s.f}>
        <Ic name="pin" />
        {c.location}
      </span>,
    );
  if (c.availability)
    facts.push(
      <span key="avail" className={s.f}>
        <Ic name="clock" />
        {c.availability}
      </span>,
    );
  if (c.years != null)
    facts.push(
      <span key="years" className={s.f}>
        <Ic name="user" />
        {c.years} {c.years === 1 ? t("candidates.year") : t("candidates.years")}
      </span>,
    );

  const hasContact = Boolean(email || phone);

  return (
    <div
      className={cn(s["jd-scrim"], show && s.show)}
      onClick={(event) => {
        if (event.target === event.currentTarget) doClose();
      }}
    >
      <div
        className={s.jd}
        role="dialog"
        aria-modal="true"
        aria-label={`${c.name} details`}
      >
        <button
          type="button"
          className={s["jd-close"]}
          onClick={doClose}
          aria-label={t("candidates.close")}
        >
          <Ic name="close" />
        </button>

        <div className={s["jd-body"]}>
          <span className={s["jd-src"]}>
            {c.verified ? (
              <>
                <ChatMark />
                {t("candidates.verifiedSrc")}
              </>
            ) : (
              <>
                <Ic name="globe" />
                {t("candidates.foundSrc")}
              </>
            )}
          </span>

          <div className={s["jd-title"]}>
            <span>{c.name}</span>
            {c.verified ? <Ic name="verified" title={t("candidates.verifiedSrc")} /> : null}
          </div>

          {c.title || c.location ? (
            <div className={s["jd-co"]}>
              {c.title ? <span>{c.title}</span> : null}
              {c.title && c.location ? <span className={s.dotsep} /> : null}
              {c.location ? <span>{c.location}</span> : null}
            </div>
          ) : null}

          {c.matchScore != null ? (
            <div className={s["jd-match"]}>
              <Ic name="checkBold" />
              {t("candidates.matchWithRole", { n: c.matchScore })}
            </div>
          ) : null}

          {c.salary ? <div className={s["jd-salary"]}>{c.salary}</div> : null}

          {facts.length > 0 ? <div className={s["jd-facts"]}>{facts}</div> : null}

          {c.summary ? (
            <div className={s["jd-sec"]}>
              <h3>{t("candidates.about")}</h3>
              <p>{c.summary}</p>
            </div>
          ) : null}

          {c.experience.length > 0 ? (
            <div className={s["jd-sec"]}>
              <h3>{t("candidates.experience")}</h3>
              <ul className={s["jd-list"]}>
                {c.experience.map((item) => (
                  <li key={item}>
                    <Ic name="checkBold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {c.skills.length > 0 ? (
            <div className={s["jd-sec"]}>
              <h3>{t("candidates.skills")}</h3>
              <ul className={s["jd-list"]}>
                {c.skills.map((skill) => (
                  <li key={skill}>
                    <Ic name="checkBold" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className={s["jd-sec"]}>
            <h3>{t("candidates.howReach")}</h3>
            {hasContact ? (
              <div className={s["jd-contact"]}>
                <div className={s["jd-crow"]}>
                  <Ic name="user" />
                  <span className={s.nm}>{c.name}</span>
                </div>
                {phone ? (
                  <div className={s["jd-crow"]}>
                    <Ic name="phone" />
                    <a href={`tel:${phone}`}>{phone}</a>
                  </div>
                ) : null}
                {email ? (
                  <div className={s["jd-crow"]}>
                    <Ic name="mail" />
                    <a href={`mailto:${email}`}>{email}</a>
                  </div>
                ) : null}
              </div>
            ) : (
              <p>{t("candidates.reachMsg", { name: firstName })}</p>
            )}
          </div>
        </div>

        <div className={s["jd-foot"]}>
          {email ? (
            <a className={cn(s.btn, s["btn-ghost"], s["btn-md"])} href={`mailto:${email}`}>
              {t("candidates.email")}
            </a>
          ) : null}
          {phone ? (
            <a className={cn(s.btn, s["btn-primary"], s["btn-md"])} href={`tel:${phone}`}>
              {t("candidates.call")}
            </a>
          ) : (
            <button
              type="button"
              className={cn(s.btn, s["btn-primary"], s["btn-md"])}
              onClick={() => {
                doClose();
                router.push(routes.applicants);
                toast(t("candidates.msgOpened", { name: firstName }));
              }}
            >
              {t("candidates.message", { name: firstName })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
