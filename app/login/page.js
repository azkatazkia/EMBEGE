"use client";

import { createClient } from "@/lib/supabase";

export default function LoginPage() {

  const supabase = createClient();

  return (
    <main className="min-h-screen grid grid-cols-2 bg-[#F5EEDC]">

      {/* LEFT */}
      <section className="flex flex-col justify-center px-16">

        <h1 className="text-6xl font-bold leading-tight tracking-[-0.04em] max-w-xl">
          Welcome back.
        </h1>

        <p className="mt-6 text-lg text-[#5C594F] max-w-lg leading-8">
          Continue managing your household inventory,
          grocery list, and smart recipe suggestions.
        </p>

      </section>

      {/* RIGHT */}
      <section className="flex items-center justify-center bg-[#FBF8EF]">

        <div className="w-full max-w-[420px] rounded-[32px] bg-[#F5EEDC] p-9 shadow-sm">

          <h2 className="text-4xl font-bold tracking-[-0.02em]">
            Log in
          </h2>

          <p className="mt-3 text-[#5C594F]">
            Continue to your household dashboard.
          </p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault();

              const email = e.target.email.value;
              const password = e.target.password.value;

              const { error } =
                await supabase.auth.signInWithPassword({
                  email,
                  password,
                });

              if (error) {
                alert(error.message);
                return;
              }

              window.location.href = "/dashboard";
            }}
          >

            <input
              name="email"
              type="email"
              placeholder="Email"
              className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
            />

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#6E8551] text-[#F5EEDC] font-semibold hover:bg-[#4A5C35] transition"
            >
              Log In
            </button>

          </form>

          <p className="mt-6 text-sm text-center text-[#5C594F]">
            New to Embege?{" "}
            <a
              href="/signup"
              className="font-bold text-[#4A5C35]"
            >
              Create your household
            </a>
          </p>

        </div>
      </section>
    </main>
  );
}