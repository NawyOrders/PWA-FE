import { z } from "zod";

export const ReverseGeocodeResponseSchema = z.object({
  display_name: z.string().min(1).optional(),
  lat: z.string().optional(),
  lon: z.string().optional(),
});

export const SearchAddressSchema = z.object({
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  place_id: z.number().optional(),
});

export const SearchAddressesResponseSchema = z.array(SearchAddressSchema);

export type ReverseGeocodeResponse = z.infer<typeof ReverseGeocodeResponseSchema>;
export type SearchAddress = z.infer<typeof SearchAddressSchema>;
export type SearchAddressesResponse = z.infer<typeof SearchAddressesResponseSchema>;
