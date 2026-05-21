"use client";

export default function SignupPage() {
  return (
    <main className="min-h-screen grid grid-cols-2 bg-[#F5EEDC]">

      {/* LEFT */}
      <section className="flex flex-col justify-center px-16">

        <h1 className="text-6xl font-bold leading-tight tracking-[-0.04em] max-w-xl">
          Start with your household.
        </h1>

        <p className="mt-6 text-lg text-[#5C594F] max-w-lg leading-8">
          Create an account, invite your family or roommates,
          and keep everyone’s groceries in sync.
        </p>

      </section>

      {/* RIGHT */}
      <section className="flex items-center justify-center bg-[#FBF8EF]">

        <div className="w-full max-w-[420px] rounded-[32px] bg-[#F5EEDC] p-9 shadow-sm">

          <h2 className="text-4xl font-bold tracking-[-0.02em]">
            Create your household account
          </h2>

          <p className="mt-3 text-[#5C594F]">
            Set up your Embege profile.
          </p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/household";
            }}
          >
            <input
              type="text"
              placeholder="Name"
              className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
            />

            <input
              type="email"
              placeholder="Email"
              className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
            />

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#6E8551] text-[#F5EEDC] font-semibold hover:bg-[#4A5C35] transition"
            >
              Sign Up
            </button>

          </form>

          <p className="mt-6 text-sm text-center text-[#5C594F]">
            Already have an account?{" "}
            <a href="/login" className="font-bold text-[#4A5C35]">
              Log in
            </a>
          </p>

        </div>
      </section>
    </main>
  );
}