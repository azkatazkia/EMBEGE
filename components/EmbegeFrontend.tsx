"use client";

export default function EmbegeFrontend() {
  return (
    <div className="min-h-screen bg-[#F5EEDC] text-[#1F1F1B]">
      <section className="min-h-screen grid grid-cols-2">
        
        {/* LEFT */}
        <div className="flex flex-col justify-center px-16">
          <h1 className="text-6xl font-bold leading-tight tracking-[-0.04em] max-w-xl">
            Cook what you already have. Waste less together.
          </h1>

          <p className="mt-6 text-lg text-[#5C594F] max-w-lg leading-8">
            Embege helps your household track groceries,
            avoid double buying, and turn expiring food
            into dinner ideas.
          </p>

          <div className="mt-10 bg-[#EAE2CE] rounded-[32px] p-7 w-[520px] shadow-sm">
            
            <div className="bg-white/30 rounded-3xl p-6 mb-6">
              <div className="text-sm font-semibold text-[#8A8275] mb-2">
                ✦ Gibrain
              </div>

              <h3 className="text-2xl font-bold mb-2">
                Cook shrimp and cucumber tonight.
              </h3>

              <p className="text-[#5C594F]">
                Both expire today. Shrimp fried rice uses what you already have.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              
              <div className="bg-[#DDD4BD] rounded-2xl p-4">
                <div className="text-4xl mb-3">🍤</div>
                <div className="font-semibold">Shrimp</div>

                <div className="mt-2 inline-flex h-6 items-center rounded-full bg-[#4A5C35] px-3 text-xs font-semibold text-[#F5EEDC]">
                  Expires today
                </div>
              </div>

              <div className="bg-[#DDD4BD] rounded-2xl p-4">
                <div className="text-4xl mb-3">🥒</div>
                <div className="font-semibold">Cucumber</div>

                <div className="mt-2 inline-flex h-6 items-center rounded-full bg-[#4A5C35] px-3 text-xs font-semibold text-[#F5EEDC]">
                  Expires today
                </div>
              </div>

              <div className="bg-[#DDD4BD] rounded-2xl p-4">
                <div className="text-4xl mb-3">🥛</div>
                <div className="font-semibold">Milk</div>

                <div className="mt-2 inline-flex h-6 items-center rounded-full bg-[#EAE2CE] px-3 text-xs font-semibold text-[#5C594F]">
                  2 days left
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center justify-center bg-[#FBF8EF]">
          
          <div className="w-full max-w-[420px] rounded-[32px] bg-[#F5EEDC] p-9 shadow-sm">
            
            <h2 className="text-4xl font-bold tracking-[-0.02em]">
              Welcome to Embege
            </h2>

            <p className="mt-3 text-[#5C594F]">
              Your shared household food intelligence app.
            </p>

            <div className="mt-8 grid gap-4">
              
              <a
                href="/signup"
                className="flex h-12 items-center justify-center rounded-xl bg-[#6E8551] text-[#F5EEDC] font-semibold hover:bg-[#4A5C35] transition"
              >
                Get Started
              </a>

              <a
                href="/login"
                className="flex h-12 items-center justify-center rounded-xl border border-black/10 bg-[#EAE2CE] font-semibold"
              >
                I already have an account
              </a>

            </div>

          </div>
        </div>

      </section>
    </div>
  );
}