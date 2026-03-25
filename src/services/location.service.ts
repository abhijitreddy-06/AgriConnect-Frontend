export interface ResolvedLocation {
  address: string;
  latitude: number;
  longitude: number;
}

const formatAddressFromNominatim = (payload: any) => {
  if (!payload?.address) return payload?.display_name || "";

  const a = payload.address;
  const parts = [
    a.road,
    a.suburb || a.neighbourhood,
    a.city || a.town || a.village,
    a.state,
    a.postcode,
    a.country,
  ].filter(Boolean);

  return parts.join(", ");
};

export const locationService = {
  async getCurrentLocationAddress(): Promise<ResolvedLocation> {
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported in this browser.");
    }

    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    let address = `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const payload = await response.json();
        const resolved = formatAddressFromNominatim(payload);
        if (resolved) {
          address = resolved;
        }
      }
    } catch {
      // Fallback to coordinates if reverse geocoding fails.
    }

    return { address, latitude, longitude };
  },
};
