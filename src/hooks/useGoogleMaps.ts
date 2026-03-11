import { useEffect, useRef, useCallback, useState } from "react";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let googleMapsLoaded = false;
let googleMapsLoading = false;
const loadCallbacks: (() => void)[] = [];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: Window & { google?: any };

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve) => {
    if (googleMapsLoaded) {
      resolve();
      return;
    }

    loadCallbacks.push(resolve);

    if (googleMapsLoading) return;
    googleMapsLoading = true;

    if (!GOOGLE_MAPS_API_KEY) {
      googleMapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      googleMapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    script.onerror = () => {
      googleMapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

interface PlaceResult {
  address: string;
  latitude: number | null;
  longitude: number | null;
}

export function useGooglePlacesAutocomplete(
  onPlaceSelected: (result: PlaceResult) => void
) {
  const inputNodeRef = useRef<HTMLInputElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const autocompleteRef = useRef<any>(null);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const [isAvailable, setIsAvailable] = useState(false);
  const [scriptReady, setScriptReady] = useState(googleMapsLoaded);

  // Keep callback ref up to date to avoid stale closures
  onPlaceSelectedRef.current = onPlaceSelected;

  const initAutocomplete = useCallback((node: HTMLInputElement) => {
    if (!window.google?.maps?.places || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      node,
      {
        types: ["establishment", "geocode"],
        componentRestrictions: { country: "nz" },
        fields: ["formatted_address", "geometry", "name"],
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place) {
        const address = place.formatted_address || place.name || "";
        const lat = place.geometry?.location?.lat() ?? null;
        const lng = place.geometry?.location?.lng() ?? null;
        onPlaceSelectedRef.current({
          address,
          latitude: lat,
          longitude: lng,
        });
      }
    });

    autocompleteRef.current = autocomplete;
    setIsAvailable(true);
  }, []);

  // Load the Google Maps script on mount
  useEffect(() => {
    loadGoogleMapsScript().then(() => {
      if (window.google?.maps?.places) {
        setScriptReady(true);
      }
    });
  }, []);

  // Try to initialize when script becomes ready and input is already mounted
  useEffect(() => {
    if (scriptReady && inputNodeRef.current && !autocompleteRef.current) {
      initAutocomplete(inputNodeRef.current);
    }
  }, [scriptReady, initAutocomplete]);

  // Callback ref to detect when the input mounts/unmounts (handles Dialog portals)
  const inputRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputNodeRef.current = node;
      if (node && scriptReady && !autocompleteRef.current) {
        initAutocomplete(node);
      }
      if (!node && autocompleteRef.current) {
        // Input unmounted (e.g. dialog closed) - cleanup for re-initialization
        window.google?.maps?.event?.clearInstanceListeners(
          autocompleteRef.current
        );
        autocompleteRef.current = null;
        setIsAvailable(false);
      }
    },
    [scriptReady, initAutocomplete]
  );

  return { inputRef, isAvailable };
}

export function hasGoogleMapsKey(): boolean {
  return !!GOOGLE_MAPS_API_KEY;
}

export function getGoogleMapsEmbedUrl(
  latitude: number,
  longitude: number
): string {
  if (GOOGLE_MAPS_API_KEY) {
    return `https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${latitude},${longitude}&zoom=15`;
  }
  // Fallback to OpenStreetMap embed
  return `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005},${latitude - 0.003},${longitude + 0.005},${latitude + 0.003}&layer=mapnik&marker=${latitude},${longitude}`;
}

export function getStaticMapUrl(
  latitude: number,
  longitude: number
): string {
  // Always available OpenStreetMap link
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}
