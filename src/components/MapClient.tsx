"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import type { CityMarker } from "@/lib/geocode";
import "leaflet/dist/leaflet.css";

interface Props {
  markers: CityMarker[];
}

export default function MapClient({ markers }: Props) {
  useEffect(() => {
    // Fix leaflet container height on hydration
  }, []);

  return (
    <MapContainer
      center={[51.5, 5.0]}
      zoom={9}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {markers.map((marker) => (
        <CircleMarker
          key={marker.city}
          center={[marker.lat, marker.lng]}
          radius={Math.min(6 + marker.stakeholders.length * 2, 20)}
          pathOptions={{
            fillColor: "#1B5E35",
            fillOpacity: 0.85,
            color: "#ffffff",
            weight: 2,
          }}
        >
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="font-semibold text-gray-900 mb-2">{marker.city}</p>
              <ul className="space-y-1">
                {marker.stakeholders.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/stakeholders/${s.slug}`}
                      className="text-brand hover:underline"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
