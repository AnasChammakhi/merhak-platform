export default function Login() {
  return (
    <div className="min-h-screen bg-white px-6 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
            M
          </div>
          <span className="text-sm font-semibold text-slate-800">Merhak</span>
        </div>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl items-center justify-center px-2 py-8 sm:px-4 lg:px-6">
        <div className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="absolute right-[-80px] top-8 h-56 w-56 rounded-full bg-[#429ef5]/30 blur-3xl" />
          <div className="absolute bottom-[-40px] right-[80px] h-40 w-40 rounded-full bg-[#429ef5]/20 blur-3xl" />

          <div className="relative grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[1fr_0.9fr] lg:px-14 lg:py-14">
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Sign in to your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Welcome back. Please enter your credentials to continue.
              </p>

              <form action="#" method="POST" className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-left text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                      Forgot?
                    </a>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                >
                  Sign in
                </button>
              </form>
            </div>

            <div className="relative flex min-h-[280px] items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <div className="absolute right-[-20px] top-6 h-40 w-40 rounded-full bg-[#429ef5]/30 blur-3xl" />
              <div className="absolute left-8 top-10 h-24 w-24 rounded-full border border-[#429ef5]/20 bg-[#429ef5]/10" />
              <div className="relative z-10 text-center text-slate-600">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#429ef5]">
                  Secure access
                </p>
                <p className="mt-3 text-sm leading-6">
                  Your login experience stays simple, clean, and protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
