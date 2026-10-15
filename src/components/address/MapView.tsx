"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { Coordinates } from "@/lib/geocoding";

type Props = {
  location: Coordinates;
  onLocationChange: (location: Coordinates) => void;
  zoom: number;
};

function MapController({
  location,
  zoom,
}: {
  location: Coordinates;
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lng], zoom);
  }, [map, location.lat, location.lng, zoom]);

  return null;
}

function MapEvents({
  onLocationChange,
}: {
  onLocationChange: Props["onLocationChange"];
}) {
  useMapEvents({
    click(event) {
      onLocationChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

export default function MapView({ location, onLocationChange, zoom }: Props) {
  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={zoom}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController location={location} zoom={zoom} />

      <MapEvents onLocationChange={onLocationChange} />

      <CircleMarker
        center={[location.lat, location.lng]}
        radius={9}
        pathOptions={{
          color: "#ffffff",
          fillColor: "#f0442e",
          fillOpacity: 1,
          weight: 3,
        }}
      />
    </MapContainer>
  );
}
