export default function Skeletons() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-[260px] bg-gray-300 rounded-lg"></div>
          <div className="h-4 bg-gray-300 mt-3 w-3/4 rounded"></div>
        </div>
      ))}
    </div>
  );
}