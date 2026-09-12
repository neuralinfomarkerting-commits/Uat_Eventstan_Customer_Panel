'use client';

const EVENT_TYPES_SLUGS = [
  { slug: "weddings", name: "Weddings" },
  { slug: "birthdays", name: "Birthday Parties" },
  { slug: "corporate", name: "Corporate Events" },
  { slug: "proposals", name: "Proposals & Anniversaries" },
  { slug: "baby-showers", name: "Baby Showers" },
  { slug: "graduations", name: "Graduations & Milestones" },
];

export default function EventTypePills() {
  return (
    <div className="flex flex-wrap gap-2.5 justify-center max-w-xl mx-auto">
      {EVENT_TYPES_SLUGS.map((event) => (
        <button
          key={event.slug}
          onClick={() => {
            const el = document.getElementById(event.slug);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="text-sm text-gray-700 border border-gray-300 rounded-full px-5 py-2 transition-colors duration-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 cursor-pointer bg-transparent"
        >
          {event.name}
        </button>
      ))}
    </div>
  );
}