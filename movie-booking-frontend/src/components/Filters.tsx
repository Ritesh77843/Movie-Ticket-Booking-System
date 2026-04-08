"use client";

export default function Filters() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-3">Filters</h3>

      <div className="mb-4">
        <p className="font-semibold">Language</p>
        <div className="flex flex-col gap-2 mt-2">
          <label><input type="checkbox" /> Hindi</label>
          <label><input type="checkbox" /> English</label>
        </div>
      </div>

      <div>
        <p className="font-semibold">Format</p>
        <div className="flex flex-col gap-2 mt-2">
          <label><input type="checkbox" /> 2D</label>
          <label><input type="checkbox" /> 3D</label>
        </div>
      </div>
    </div>
  );
}