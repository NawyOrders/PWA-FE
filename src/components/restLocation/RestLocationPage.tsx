"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Branch = {
  id: string;
  name: string;
  address: string;
  distance: string;
  isOpen: boolean;
};

const branches: Branch[] = [
  { id: "nakheel-1", name: "فرع النخيل", address: "حي النخيل، شارع السلطان محمد فرع الملك، الإسكندرية، مصر", distance: "1.5 كم", isOpen: true },
  { id: "nakheel-2", name: "فرع النخيل", address: "حي النخيل، شارع السلطان محمد فرع الملك، الإسكندرية، مصر", distance: "10 كم", isOpen: true },
  { id: "nakheel-3", name: "فرع النخيل", address: "حي النخيل، شارع السلطان محمد فرع الملك، الإسكندرية، مصر", distance: "4 كم", isOpen: false },
  { id: "nakheel-4", name: "فرع النخيل", address: "حي النخيل، شارع السلطان محمد فرع الملك، الإسكندرية، مصر", distance: "7 كم", isOpen: false },
];

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
  branch: Branch;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
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
          <strong>{branch.name}</strong>
          <span className={`rest-branch-status${branch.isOpen ? " status-open" : " status-closed"}`}>
            {branch.isOpen ? "مفتوح الآن" : "مغلق"}
          </span>
        </span>
        <span className="rest-branch-address">{branch.address}</span>
        <span className="rest-branch-distance"><PinIcon />{branch.distance}</span>
      </span>
    </button>
  );
}

export default function RestLocationPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(branches[0].id);
  const [isContinuing, setIsContinuing] = useState(false);
  const selectedBranch = branches.find((branch) => branch.id === selectedId) ?? branches[0];

  function selectBranch(id: string) {
    setSelectedId(id);
  }

  function confirmBranch() {
    if (isContinuing) return;
    setIsContinuing(true);
    try {
      window.sessionStorage.setItem("nawyorders-selected-branch", JSON.stringify(selectedBranch));
    } catch {
      // Payment remains usable when browser storage is unavailable.
    }
    router.push("/payment");
  }

  return (
    <main className="rest-location-page">
      <div className="rest-location-shell">
        <header className="rest-location-header">
          <Link
            className="rest-location-back"
            href="/delivery"
            aria-label="العودة إلى طريقة الاستلام"
          >
            <ArrowIcon />
          </Link>
          <div>
            <h1>اختر الفرع</h1>
            <p>اختر الفرع الأقرب إليك لاستلام الطلب</p>
          </div>
        </header>

        <section
          className="rest-branch-list"
          role="radiogroup"
          aria-label="فروع المطعم"
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
            <span>الفرع المختار</span>
            <strong>{selectedBranch.name}</strong>
          </div>
          <button
            className="rest-confirm-button"
            type="button"
            onClick={confirmBranch}
            disabled={isContinuing}
          >
            {isContinuing ? "جارٍ الانتقال إلى الدفع…" : "تأكيد الفرع"}
          </button>
        </footer>
        <div className="rest-home-indicator" aria-hidden="true" />
      </div>
    </main>
  );
}
