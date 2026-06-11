export default function LoginPage({
  searchParams,
}: {
  searchParams: { from?: string; error?: string };
}) {
  const from = searchParams.from || "/";
  const hasError = searchParams.error === "1";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold text-brand">brabant</span>
          <span className="text-2xl font-bold text-gray-900">.ai</span>
          <p className="text-sm text-gray-500 mt-2">
            Voer het wachtwoord in om verder te gaan
          </p>
        </div>

        <form
          method="POST"
          action="/api/auth"
          className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm"
        >
          <input type="hidden" name="from" value={from} />

          {hasError && (
            <p className="text-red-500 text-sm mb-4 text-center">
              Ongeldig wachtwoord. Probeer opnieuw.
            </p>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wachtwoord
          </label>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand mb-4"
            placeholder="••••••••••••"
          />

          <button
            type="submit"
            className="w-full bg-brand text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-brand-light transition-colors"
          >
            Inloggen
          </button>
        </form>
      </div>
    </div>
  );
}
