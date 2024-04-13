"use client";

import ReactDOM from "react-dom";

import { URL_ANALYTICS_CITIES } from "@/shared/data/DataStorage";

export function PreloadResources() {
    // <link rel="preload" href="/api/data" as="fetch" crossorigin="anonymous">

    ReactDOM.preload(URL_ANALYTICS_CITIES, { as: "fetch" });
    // ReactDOM.preconnect("...", { crossOrigin: "..." });
    // ReactDOM.prefetchDNS("...");

    return null;
}
