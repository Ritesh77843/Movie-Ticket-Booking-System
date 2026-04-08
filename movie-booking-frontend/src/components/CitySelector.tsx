"use client";

import { useState } from "react";

export default function CitySelector() {
  const [city, setCity] = useState("Mumbai");

  return (
    <select
      value={city}
      onChange={(e) => setCity(e.target.value)}
      className="border rounded px-2 py-1"
    >
      <option>Mumbai</option>
      <option>Pune</option>
      <option>Delhi</option>
    </select>
  );
}