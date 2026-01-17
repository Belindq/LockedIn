export async function validateAddress(address: string): Promise<{ isValid: boolean, coordinates?: { lat: number, lng: number }, formattedAddress?: string }> {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
            headers: {
                'User-Agent': 'LockedInApp/1.0' // Nominatim requires a User-Agent
            }
        });

        if (!response.ok) {
            console.error('Address validation failed:', response.statusText);
            return { isValid: false };
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const result = data[0];
            return {
                isValid: true,
                coordinates: {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon)
                },
                formattedAddress: result.display_name
            };
        }

        return { isValid: false };

    } catch (error) {
        console.error('Error validating address:', error);
        // In case of API failure, we might want to fail safe or block. 
        // For now, let's treat network error as invalid address to be safe, 
        // or we could throw to let the caller decide.
        return { isValid: false };
    }
}
