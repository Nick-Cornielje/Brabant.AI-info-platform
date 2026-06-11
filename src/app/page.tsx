import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
      <div className="max-w-2xl">
        <span className="inline-block bg-brand-muted text-brand text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
          AI Ecosysteem Brabant
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Verbindt Brabant met{" "}
          <span className="text-brand">AI-kennis en innovatie</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          brabant.ai brengt organisaties, onderzoekers, bedrijven en overheden
          samen rond artificiële intelligentie in Brabant. Ontdek het ecosysteem
          en vind de partij die bij jouw vraag past.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/stakeholders"
            className="inline-flex items-center justify-center gap-2 bg-brand text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-light transition-colors"
          >
            Bekijk alle stakeholders
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          {
            label: "AI Adoptie",
            desc: "Organisaties die AI in praktijk brengen",
            icon: "🏭",
          },
          {
            label: "AI Innovatie",
            desc: "Onderzoek en nieuwe toepassingen",
            icon: "🔬",
          },
          {
            label: "Talent & Educatie",
            desc: "Opleidingen en kennisdeling",
            icon: "🎓",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="border border-gray-100 rounded-xl p-6 bg-white hover:border-brand/30 hover:shadow-sm transition-all"
          >
            <div className="text-2xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.label}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
