export type Coordinates = {
  lat: number;
  lng: number;
};

export type AddressResult = {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
};

type GeocodingLanguage = "ar" | "en";

export async function reverseGeocode(
  location: Coordinates,
  signal?: AbortSignal,
  language: GeocodingLanguage = "ar",
): Promise<string> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(location.lat),
    lon: String(location.lng),
    "accept-language": language,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(language === "ar" ? "تعذر الحصول على العنوان" : "Unable to retrieve the address.");
  }

  const data: { display_name?: string } = await response.json();

  if (!data.display_name) {
    throw new Error(language === "ar" ? "لم يتم العثور على عنوان لهذا الموقع" : "No address was found for this location.");
  }

  return data.display_name;
}

export async function searchAddresses(
  query: string,
  signal?: AbortSignal,
  language: GeocodingLanguage = "ar",
): Promise<AddressResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "5",
    addressdetails: "1",
    "accept-language": language,
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(language === "ar" ? "تعذر البحث عن العنوان" : "Unable to search for this address.");
  }

  return response.json();
}
