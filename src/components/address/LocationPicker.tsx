"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  reverseGeocode,
  searchAddresses,
  type AddressResult,
  type Coordinates,
} from "@/lib/geocoding";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="address-map-loading">جاري تحميل الخريطة...</div>
  ),
});

const savedAddresses = [
  {
    id: "home",
    label: "المنزل",
    details: "حي النخيل، شارع السلطان محمد",
    location: { lat: 31.2001, lng: 29.9187 },
    icon: "/icons/house.svg",
  },
  {
    id: "work",
    label: "العمل",
    details: "كرموز، شارع الوردانية",
    location: { lat: 31.2155, lng: 29.9553 },
    icon: "/icons/workbag.svg",
  },
  {
    id: "family",
    label: "منزل العائلة",
    details: "وسط البلد، جليم",
    location: { lat: 31.1975, lng: 29.9042 },
    icon: "/icons/storelocation.svg",
  },
];

function Icon({ name }: { name: "arrow" | "radio" | "check" }) {
  if (name === "arrow")
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M19 12H5m7 7-7-7 7-7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  if (name === "check")
    return (
      <svg viewBox="0 0 24 2" fill="none" aria-hidden="true">
        <path
          d="m5 12 4 4L19 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" fill="currentColor" />
    </svg>
  );
}

export default function LocationPicker() {
  const router = useRouter();
  const [location, setLocation] = useState<Coordinates>({
    lat: 31.2001,
    lng: 29.9187,
  });
  const [zoom, setZoom] = useState(13);
  const [address, setAddress] = useState("");
  const [addressLoading, setAddressLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AddressResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSavedAddress, setSelectedSavedAddress] = useState("home");
  const [isContinuing, setIsContinuing] = useState(false);
  const skipReverseGeocode = useRef(false);

  useEffect(() => {
    if (skipReverseGeocode.current) {
      skipReverseGeocode.current = false;
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setAddressLoading(true);
      setError("");

      try {
        const result = await reverseGeocode(location, controller.signal);
        setAddress(result);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setAddress("");
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setAddressLoading(false);
        }
      }
    }, 1100);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [location]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();

    if (!value) {
      setError("اكتب اسم المكان أو العنوان أولًا");
      return;
    }

    setSearchLoading(true);
    setError("");
    setResults([]);

    try {
      const matches = await searchAddresses(value);
      setResults(matches);
      if (matches.length === 0) {
        setError("ملقيناش نتائج. جرّب اسم شارع أو منطقة تانية.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "حصل خطأ أثناء البحث");
    } finally {
      setSearchLoading(false);
    }
  }

  function selectResult(result: AddressResult) {
    const nextLocation = {
      lat: Number(result.lat),
      lng: Number(result.lon),
    };

    if (
      !Number.isFinite(nextLocation.lat) ||
      !Number.isFinite(nextLocation.lng)
    ) {
      setError("إحداثيات المكان غير صالحة");
      return;
    }

    skipReverseGeocode.current =
      nextLocation.lat !== location.lat || nextLocation.lng !== location.lng;
    setLocation(nextLocation);
    setZoom(16);
    setAddress(result.display_name);
    setAddressLoading(false);
    setSelectedSavedAddress("");
    setResults([]);
    setQuery(result.display_name);
    setError("");
  }

  function locateMe() {
    if (!navigator.geolocation) {
      setError("المتصفح لا يدعم تحديد الموقع");
      return;
    }

    setError("");
    setAddress("");
    setSelectedSavedAddress("");
    setQuery("");
    setResults([]);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setZoom(16);
      },
      (geoError) => {
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? "اسمح للموقع بالوصول لموقعك من إعدادات المتصفح."
            : geoError.code === geoError.TIMEOUT
              ? "تحديد الموقع استغرق وقتًا طويلًا. حاول مرة أخرى."
              : "تعذر تحديد موقعك الحالي.";
        setError(message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 },
    );
  }

  function selectSavedAddress(saved: (typeof savedAddresses)[number]) {
    const locationChanged =
      saved.location.lat !== location.lat ||
      saved.location.lng !== location.lng;
    skipReverseGeocode.current = locationChanged;
    setLocation(saved.location);
    setZoom(16);
    setAddress(saved.details);
    setAddressLoading(false);
    setSelectedSavedAddress(saved.id);
    setQuery("");
    setResults([]);
    setError("");
  }

  function startNewAddress() {
    setSelectedSavedAddress("");
    setAddress("");
    setQuery("");
    setResults([]);
    setError("اضغط على الخريطة لتحديد موقع العنوان الجديد");
  }

  function confirmAddress() {
    if (!address || addressLoading || isContinuing) {
      setError("انتظر حتى يتم تحديد عنوان الموقع");
      return;
    }

    const selectedAddress = {
      address,
      latitude: location.lat,
      longitude: location.lng,
      deliveryFee: 30,
    };

    try {
      window.sessionStorage.setItem(
        "nawyorders-selected-address",
        JSON.stringify(selectedAddress),
      );
    } catch {
      // Continue to payment even when browser storage is unavailable.
    }

    setIsContinuing(true);
    router.push("/payment");
  }

  return (
    <main className="address-page" dir="rtl">
      <div className="address-shell">
        <section
          className="address-map-section"
          aria-label="اختر موقع التوصيل على الخريطة"
        >
          <div className="address-map-canvas">
            <MapView
              location={location}
              onLocationChange={(nextLocation) => {
                setLocation(nextLocation);
                setSelectedSavedAddress("");
                setAddress("");
                setResults([]);
                setError("");
              }}
              zoom={zoom}
            />
          </div>

          <div className="address-map-controls">
            <button
              className="address-locate"
              type="button"
              onClick={locateMe}
              aria-label="استخدم موقعي الحالي"
              title="استخدم موقعي الحالي"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            <form className="address-search" onSubmit={handleSearch}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث عن موقع"
                aria-label="ابحث عن موقع"
              />
              <button type="submit" disabled={searchLoading} aria-label="بحث">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle
                    cx="10.8"
                    cy="10.8"
                    r="6.8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m16 16 4.5 4.5"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </form>

            <Link
              className="address-back"
              href="/delivery"
              aria-label="العودة لطريقة الاستلام"
            >
              <Icon name="arrow" />
            </Link>
          </div>

          {results.length > 0 && (
            <ul className="address-search-results">
              {results.map((result) => (
                <li key={result.place_id}>
                  <button type="button" onClick={() => selectResult(result)}>
                    {result.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {(error || searchLoading) && (
            <p
              className={`address-map-feedback${error ? " is-error" : ""}`}
              role={error ? "alert" : "status"}
            >
              {error || "جاري البحث عن الموقع..."}
            </p>
          )}
        </section>

        <section className="address-sheet" aria-labelledby="address-title">
          <div className="address-store-badge">
            <span>
              خط العرض: <bdi dir="ltr">{location.lat.toFixed(6)}</bdi>
            </span>
            <span>
              خط الطول: <bdi dir="ltr">{location.lng.toFixed(6)}</bdi>
            </span>
          </div>

          <div className="address-sheet-content">
            <h1 id="address-title">اختار عنوان التوصيل</h1>
            <div
              className="address-list"
              role="radiogroup"
              aria-label="العناوين المحفوظة"
            >
              {savedAddresses.map((saved) => {
                const selected = selectedSavedAddress === saved.id;
                return (
                  <button
                    className={`address-card${selected ? " is-selected" : ""}`}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    key={saved.id}
                    onClick={() => selectSavedAddress(saved)}
                  >
                    <span
                      className={`address-radio${selected ? " is-selected" : ""}`}
                      aria-hidden="true"
                    >
                      {selected && <span />}
                    </span>
                    <span className="address-card-copy">
                      <strong>{saved.label}</strong>
                      <span>{saved.details}</span>
                    </span>
                    <span className="address-card-icon">
                      <Image src={saved.icon} alt="" width={28} height={28} />
                    </span>
                  </button>
                );
              })}
            </div>

            <p
              className={`address-current-location${selectedSavedAddress ? "" : " is-visible"}`}
              aria-live="polite"
            >
              {addressLoading
                ? "جاري تحديد العنوان..."
                : address || "اضغط على الخريطة لتحديد عنوان جديد"}
            </p>

            <button
              className="address-add-new"
              type="button"
              onClick={startNewAddress}
            >
              <span aria-hidden="true">＋</span>
              أضف عنوان جديد
            </button>

            <button
              className="address-confirm"
              type="button"
              onClick={confirmAddress}
              disabled={addressLoading || !address || isContinuing}
            >
              {isContinuing ? "جارٍ الانتقال للدفع..." : "تأكيد العنوان"}
            </button>
          </div>

          <div className="address-home-indicator" aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}
