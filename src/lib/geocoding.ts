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

export async function reverseGeocode(
  location: Coordinates,
  signal?: AbortSignal,
): Promise<string> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(location.lat),
    lon: String(location.lng),
    "accept-language": "ar",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("تعذر الحصول على العنوان");
  }

  const data: { display_name?: string } = await response.json();

  if (!data.display_name) {
    throw new Error("لم يتم العثور على عنوان لهذا الموقع");
  }

  return data.display_name;
}

export async function searchAddresses(
  query: string,
  signal?: AbortSignal,
): Promise<AddressResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    limit: "5",
    addressdetails: "1",
    "accept-language": "ar",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("تعذر البحث عن العنوان");
  }

  return response.json();
}
