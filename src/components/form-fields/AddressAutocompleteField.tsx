import React, { useEffect, useRef, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface AddressAutocompleteFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

const AddressAutocompleteField = ({ value, onChange, error, required }: AddressAutocompleteFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load Google Maps JavaScript API script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current && window.google) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'US' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onChange(place.formatted_address);
        }
      });
    }
  }, [isLoaded, onChange]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        Address
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter address"
        className={cn(error ? "border-destructive" : "border-input")}
        required={required}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default AddressAutocompleteField;