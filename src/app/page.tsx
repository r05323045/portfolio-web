import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <header className="absolute top-6 left-8 text-2xl font-bold tracking-wide">MyPortfolio</header>
      <div className="text-center px-6 max-w-4xl">
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
          Track and analyze your portfolio with clean, clear insights.
        </h1>
        <p className="text-lg text-gray-400 mb-10">
          Input your holdings, instantly see performance and allocation, then schedule Discord reports.
        </p>
        <Link
          href="/portfolio"
          className="inline-block rounded-full bg-white text-black px-6 py-3 font-medium hover:bg-gray-200 transition"
        >
          Learn more →
        </Link>
      </div>
    </main>
  );
}
