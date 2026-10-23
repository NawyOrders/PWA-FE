"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { branches as restaurantBranches, type BranchId } from "@/data/branches";
import { saveSelectedBranch } from "@/lib/checkout-session";

const branchDistances: Record<BranchId, number> = {
  nakheel: 1.5,
  downtown: 4,
  karmouz: 7,
};

const branches = restaurantBranches.map((branch) => ({
  ...branch,
  distance: branchDistances[branch.id],
}));

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PinIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" fill="currentColor"/><circle cx="12" cy="10" r="2.5" fill="white" /></svg>;
}

function BranchOption({
  branch,
  selected,
  onSelect,
}: {
  branch: (typeof branches)[number];
  selected: boolean;
  onSelect: (id: BranchId) => void;
}) {
  const { t, locale } = useI18n();
  return (
    <button
      className={`rest-branch-option${selected ? " is-selected" : ""}${branch.isOpen ? " is-open" : " is-closed"}`}
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={!branch.isOpen}
      onClick={() => onSelect(branch.id)}
    >
      <span className="rest-branch-radio" aria-hidden="true">{selected && <span />}</span>
      <span className="rest-branch-copy">
        <span className="rest-branch-heading">
          <strong>{branch.name[locale]}</strong>
          <span className={`rest-branch-status${branch.isOpen ? " status-open" : " status-closed"}`}>
            {branch.isOpen ? t("openNow") : t("closed")}
          </span>
        </span>
        <span className="rest-branch-address">{branch.address[locale]}</span>
        <span className="rest-branch-distance"><PinIcon />{branch.distance} {t("distanceUnit")}</span>
      </span>
    </button>
  );
}

export default function RestLocationPage() {
  const router = useRouter();
  const { t, href, locale } = useI18n();
  const [selectedId, setSelectedId] = useState<BranchId>(branches[0].id);
  const [isContinuing, setIsContinuing] = useState(false);
  const selectedBranch = branches.find((branch) => branch.id === selectedId) ?? branches[0];

  function selectBranch(id: BranchId) {
    setSelectedId(id);
  }

  function confirmBranch() {
    if (isContinuing) return;
    setIsContinuing(true);
    saveSelectedBranch({ id: selectedBranch.id, name: selectedBranch.name });
    router.push(href("/payment"));
  }

  return (
    <main className="rest-location-page">
      <div className="rest-location-shell">
        <header className="rest-location-header">
          <Link
            className="rest-location-back"
            href={href("/delivery")}
            aria-label={t("backToDelivery")}
          >
            <ArrowIcon />
          </Link>
          <div>
            <h1>{t("chooseBranch")}</h1>
            <p>{t("chooseNearestBranch")}</p>
          </div>
        </header>

        <section
          className="rest-branch-list"
          role="radiogroup"
          aria-label={t("branches")}
        >
          {branches.map((branch) => (
            <BranchOption
              key={branch.id}
              branch={branch}
              selected={selectedId === branch.id}
              onSelect={selectBranch}
            />
          ))}
        </section>

        <footer className="rest-location-footer">
          <div className="rest-selected-branch">
            <span>{t("selectedBranch")}</span>
            <strong>{selectedBranch.name[locale]}</strong>
          </div>
          <button
            className="rest-confirm-button"
            type="button"
            onClick={confirmBranch}
            disabled={isContinuing}
          >
            {isContinuing ? t("continueToPayment") : t("confirmBranch")}
          </button>
        </footer>
        <div className="rest-home-indicator" aria-hidden="true" />
      </div>
    </main>
  );
}
