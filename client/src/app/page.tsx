import Link from "next/link";

const features = [
  {
    title: "Fast Campus Delivery",
    description: "Hot meals delivered quickly to your dorm, library, or favorite spot.",
    icon: "⚡",
  },
  {
    title: "Student Favorites",
    description: "Discover top-rated bites from campus cafes and local eateries.",
    icon: "🍕",
  },
  {
    title: "Easy Ordering",
    description: "Browse menus, customize your meal, and check out in seconds.",
    icon: "📱",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-amber-50 text-zinc-900 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-zinc-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
            CB
          </span>
          <span>
            Campus <span className="text-orange-600 dark:text-orange-400">Bite</span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-zinc-700 transition hover:bg-orange-100 hover:text-orange-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-orange-400"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-orange-500 px-4 py-2 text-white shadow-sm transition hover:bg-orange-600"
          >
            Sign Up
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-20 pt-10 md:grid-cols-2 md:pt-16">
        <div>
          <p className="mb-4 inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
            Made for campus life
          </p>
          <h1 className="max-w-xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Campus cravings,
            <span className="block text-orange-600 dark:text-orange-400">delivered fast.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Campus Bite brings your favorite meals from campus spots and nearby
            restaurants right to you. Fresh, quick, and made for hungry students.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-12 items-center justify-center rounded-full bg-orange-500 px-6 font-semibold text-white shadow-md transition hover:bg-orange-600"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full border border-orange-200 bg-white px-6 font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-orange-300 dark:hover:bg-zinc-800"
            >
              I have an account
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-tr from-orange-200/60 via-amber-100/40 to-transparent blur-2xl dark:from-orange-900/30 dark:via-amber-900/10" />
          <div className="rounded-3xl border border-orange-100 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Popular right now</h2>
              <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-950/60 dark:text-green-300">
                Live on campus
              </span>
            </div>
            <ul className="space-y-3">
              {[
                { name: "Spicy Chicken Wrap", price: "$7.99", eta: "15 min" },
                { name: "Veggie Burrito Bowl", price: "$8.49", eta: "20 min" },
                { name: "Iced Coffee & Bagel", price: "$5.99", eta: "10 min" },
              ].map((item) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">ETA {item.eta}</p>
                  </div>
                  <span className="font-semibold text-orange-600 dark:text-orange-400">
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Why students love Campus Bite
          </h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Everything you need for a tasty, hassle-free meal between classes.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-2xl dark:bg-orange-950/50">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
