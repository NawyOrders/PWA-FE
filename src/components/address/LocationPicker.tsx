"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { deliveryZones } from "@/data/branches";
import type { DeliveryQuote } from "@/lib/checkout";
import { requestDeliveryQuote } from "@/lib/checkout-client";
import { saveDeliveryQuote, saveSelectedAddress } from "@/lib/checkout-session";
import { formatPrice } from "@/lib/format";
import {
  reverseGeocode,
  searchAddresses,
  type AddressResult,
  type Coordinates,
} from "@/lib/geocoding";

function MapLoading() {
  const { t } = useI18n();
  return <div className="address-map-loading">{t("mapLoading")}</div>;
}

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <MapLoading />,
});

const savedAddresses = [
  {
    id: "home",
    location: { lat: 31.2001, lng: 29.9187 },
    icon: "/icons/house.svg",
  },
  {
    id: "work",
    location: { lat: 31.2155, lng: 29.9553 },
    icon: "/icons/workbag.svg",
  },
  {
    id: "family",
    location: { lat: 31.1975, lng: 29.9042 },
    icon: "/icons/storelocation.svg",
  },
];

const savedAddressMessages = {
  home: { label: "homeAddress", details: "homeAddressDetails" },
  work: { label: "workAddress", details: "workAddressDetails" },
  family: { label: "familyAddress", details: "familyAddressDetails" },
} as const;

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
  const { locale, t, href } = useI18n();
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
  const [zoneId, setZoneId] = useState("");
  const [quote, setQuote] = useState<DeliveryQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const skipReverseGeocode = useRef(false);
  const quoteRequest = useRef(0);

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
        const result = await reverseGeocode(location, controller.signal, locale);
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
  }, [locale, location]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();

    if (!value) {
      setError(t("searchEmpty"));
      return;
    }

    setSearchLoading(true);
    setError("");
    setResults([]);

    try {
      const matches = await searchAddresses(value, undefined, locale);
      setResults(matches);
      if (matches.length === 0) {
        setError(t("searchNoResults"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("searchFailed"));
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
      setError(t("invalidCoordinates"));
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
      setError(t("geolocationUnsupported"));
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
            ? t("geolocationDenied")
            : geoError.code === geoError.TIMEOUT
              ? t("geolocationTimeout")
              : t("geolocationFailed");
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
    const copy = savedAddressMessages[saved.id as keyof typeof savedAddressMessages];
    setAddress(t(copy.details));
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
    setError(t("chooseOnMap"));
  }

  async function selectDeliveryZone(nextZoneId: string) {
    const requestId = quoteRequest.current + 1;
    quoteRequest.current = requestId;
    setZoneId(nextZoneId);
    setQuote(null);
    setQuoteError("");
    if (!nextZoneId) return;

    setQuoteLoading(true);
    try {
      const nextQuote = await requestDeliveryQuote(nextZoneId);
      if (quoteRequest.current !== requestId) return;
      setQuote(nextQuote);
      saveDeliveryQuote(nextQuote);
    } catch {
      if (quoteRequest.current !== requestId) return;
      setQuoteError(t("deliveryQuoteError"));
    } finally {
      if (quoteRequest.current === requestId) setQuoteLoading(false);
    }
  }

  function confirmAddress() {
    if (!address || addressLoading || isContinuing) {
      setError(t("confirmAddressError"));
      return;
    }
    if (!quote) {
      setError(t("deliveryQuoteRequired"));
      return;
    }

    const selectedAddress = {
      address,
      latitude: location.lat,
      longitude: location.lng,
      zoneId: quote.zoneId,
      zoneName: quote.zoneName,
      branchId: quote.branchId,
      branchName: quote.branchName,
      deliveryFee: quote.fee,
    };

    saveSelectedAddress(selectedAddress);
    saveDeliveryQuote(quote);
    setIsContinuing(true);
    router.push(href("/payment"));
  }

  return (
    <main className="address-page" dir="rtl">
      <div className="address-shell">
        <section
          className="address-map-section"
          aria-label={t("mapAria")}
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
              aria-label={t("locateMe")}
              title={t("locateMe")}
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
                placeholder={t("searchPlace")}
                aria-label={t("searchPlace")}
              />
              <button type="submit" disabled={searchLoading} aria-label={t("search")}>
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
              href={href("/delivery")}
              aria-label={t("backToDelivery")}
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
              {error || t("searchLoading")}
            </p>
          )}
        </section>

        <section className="address-sheet" aria-labelledby="address-title">
          <div className="address-store-badge">
            <span>
              {t("latitude")}: <bdi dir="ltr">{location.lat.toFixed(6)}</bdi>
            </span>
            <span>
              {t("longitude")}: <bdi dir="ltr">{location.lng.toFixed(6)}</bdi>
            </span>
          </div>

          <div className="address-sheet-content">
            <h1 id="address-title">{t("addressTitle")}</h1>

            <div className="address-zone">
              <label htmlFor="delivery-zone">{t("deliveryArea")}</label>
              <select
                id="delivery-zone"
                value={zoneId}
                onChange={(event) => void selectDeliveryZone(event.target.value)}
                aria-describedby="delivery-zone-status"
                aria-invalid={Boolean(quoteError)}
              >
                <option value="">{t("chooseDeliveryArea")}</option>
                {deliveryZones
                  .filter((zone) => zone.isAvailable)
                  .map((zone) => (
                    <option value={zone.id} key={zone.id}>
                      {zone.name[locale]}
                    </option>
                  ))}
              </select>
              <p
                className={`address-zone-status${quoteError ? " is-error" : ""}`}
                id="delivery-zone-status"
                role={quoteError ? "alert" : "status"}
              >
                {quoteLoading
                  ? t("deliveryQuoteLoading")
                  : quoteError ||
                    (quote
                      ? `${t("deliveryFeeConfirmed").replace("{area}", quote.zoneName[locale])} · ${formatPrice(quote.fee, locale)} · ${t("branchForArea").replace("{branch}", quote.branchName[locale])}`
                      : t("deliveryFeePending"))}
              </p>
            </div>

            <div
              className="address-list"
              role="radiogroup"
              aria-label={t("savedAddresses")}
            >
              {savedAddresses.map((saved) => {
                const selected = selectedSavedAddress === saved.id;
                const addressCopy = savedAddressMessages[saved.id as keyof typeof savedAddressMessages];
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
                      <strong>{t(addressCopy.label)}</strong>
                      <span>{t(addressCopy.details)}</span>
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
                ? t("mapAddressLoading")
                : address || t("mapAddressPrompt")}
            </p>

            <button
              className="address-add-new"
              type="button"
              onClick={startNewAddress}
            >
              <span aria-hidden="true">＋</span>
              {t("addAddress")}
            </button>

            <button
              className="address-confirm"
              type="button"
              onClick={confirmAddress}
              disabled={addressLoading || !address || isContinuing}
            >
              {isContinuing ? t("continueToPayment") : t("confirmAddress")}
            </button>
          </div>

          <div className="address-home-indicator" aria-hidden="true" />
        </section>
      </div>
    </main>
  );
}
