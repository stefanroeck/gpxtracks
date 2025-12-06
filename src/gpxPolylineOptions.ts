import { PolylineOptions } from "leaflet";

export const lineStyleNormal: PolylineOptions = {
  color: "#086eb7",
  opacity: 1.0,
  weight: 4,
  lineCap: "round",
  className: "gpxTrack",
};

export const lineStyleHover = {
  color: "#ef7c0a",
  weight: 6,
};
