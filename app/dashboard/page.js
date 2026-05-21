"use client";

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#F5EEDC] flex">

      {/* SIDEBAR */}
      <aside className="m-6 w-[92px] rounded-[32px] bg-black flex flex-col items-center py-8 gap-8">

        <div className="text-white text-4xl italic font-bold">
          e
        </div>

        <div className="w-11 h-11 rounded-full bg-[#4A5C35] flex items-center justify-center text-white font-bold">
          B
        </div>

        <div className="flex flex-col items-center gap-6 mt-4 text-white/80 text-2xl">
          <div>⌂</div>
          <div>🗂</div>
          <div>🍴</div>
          <div>🛒</div>
          <a href="/household">👥</a>
          <div>✦</div>
        </div>

      </aside>

      {/* CONTENT */}
      <section className="flex-1 p-10">

        {/* AI BOX */}
        <div className="rounded-[32px] bg-[#EAE2CE] p-8 shadow-sm">

          <div className="text-[#8A8275] font-semibold mb-3">
            ✦ Gibrain
          </div>

          <h1 className="text-4xl font-bold leading-tight">
            Hi, Bach Lil! Cook shrimp and cucumber tonight.
          </h1>

          <p className="mt-3 text-lg text-[#5C594F]">
            Both expire today. Shrimp fried rice uses everything
            you have and takes 30 mins — enough for 4 people.
          </p>

          <div className="mt-6 h-14 rounded-full bg-[#DDD4BD] flex items-center px-6 text-[#8A8275]">
            Ask Gibrain a follow-up...
          </div>

        </div>

        {/* INVENTORY */}
        <section className="mt-10">

          <h2 className="text-5xl font-bold">
            Inventory
          </h2>

          <p className="mt-2 text-[#5C594F] text-lg">
            You have 3 items expiring soon
          </p>

          <div className="grid grid-cols-4 gap-5 mt-6">

            {/* CARD */}
            <div className="rounded-[28px] bg-[#EAE2CE] p-6">

              <div className="text-6xl">
                🍤
              </div>

              <h3 className="mt-5 text-3xl font-bold">
                Shrimp
              </h3>

              <div className="mt-4 inline-flex rounded-full bg-[#4A5C35] px-4 py-2 text-sm font-semibold text-[#F5EEDC]">
                Expires Today
              </div>

              <div className="mt-3 text-[#5C594F]">
                1 pax left
              </div>

            </div>

            {/* CARD */}
            <div className="rounded-[28px] bg-[#EAE2CE] p-6">

              <div className="text-6xl">
                🥒
              </div>

              <h3 className="mt-5 text-3xl font-bold">
                Cucumber
              </h3>

              <div className="mt-4 inline-flex rounded-full bg-[#4A5C35] px-4 py-2 text-sm font-semibold text-[#F5EEDC]">
                Expires Today
              </div>

              <div className="mt-3 text-[#5C594F]">
                1 pax left
              </div>

            </div>

            {/* CARD */}
            <div className="rounded-[28px] bg-[#EAE2CE] p-6">

              <div className="text-6xl">
                🥛
              </div>

              <h3 className="mt-5 text-3xl font-bold">
                Milk
              </h3>

              <div className="mt-4 inline-flex rounded-full bg-[#9DB07A] px-4 py-2 text-sm font-semibold text-white">
                2 days left
              </div>

              <div className="mt-3 text-[#5C594F]">
                1 pax left
              </div>

            </div>

            {/* SEE ALL */}
            <div className="rounded-[28px] bg-[#EAE2CE] p-6 flex items-center justify-center text-xl text-[#5C594F]">
              See all →
            </div>

          </div>

        </section>

        {/* LOWER GRID */}
        <section className="grid grid-cols-[1.1fr_1.1fr_0.9fr] gap-6 mt-10">

          {/* COOK TONIGHT */}
          <div className="rounded-[32px] bg-[#EAE2CE] p-7">

            <h3 className="text-4xl font-bold">
              Cook Tonight
            </h3>

            <div className="mt-6 rounded-[28px] bg-[#9DB07A] h-[360px] p-6 flex flex-col justify-end">

              <div className="inline-flex w-fit rounded-full bg-white/60 px-4 py-2 text-sm">
                ✓ All ingredients
              </div>

              <h4 className="mt-5 text-4xl font-bold">
                Shrimp Fried Rice
              </h4>

            </div>

          </div>

          {/* GROCERY */}
          <div className="rounded-[32px] bg-[#EAE2CE] p-7">

            <h3 className="text-4xl font-bold">
              Smart Grocery
            </h3>

            <p className="mt-2 text-[#8A8275]">
              You almost run out of eggs!
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex justify-between">
                <span>Eggs</span>
                <span className="rounded-full bg-[#4A5C35] text-white px-4 py-1 text-sm">
                  Low stock
                </span>
              </div>

              <div className="flex justify-between">
                <span>Cabbage</span>
                <span className="rounded-full bg-[#4A5C35] text-white px-4 py-1 text-sm">
                  Low stock
                </span>
              </div>

              <div className="flex justify-between">
                <span>Oat Milk</span>
                <span className="rounded-full bg-[#DDD4BD] px-4 py-1 text-sm">
                  2d left
                </span>
              </div>

            </div>

          </div>

          {/* PROGRESS */}
          <div className="flex flex-col gap-5">

            <div className="rounded-[32px] bg-[#9DB07A] p-7 h-[220px]">

              <h3 className="text-3xl font-bold text-[#2E3B1F]">
                You have saved $182
              </h3>

              <p className="mt-5 text-[#4A5C35] text-lg leading-8">
                That's a family dinner at a decent restaurant,
                paid for by not wasting food.
              </p>

            </div>

            <div className="grid grid-cols-2 gap-5">

              <div className="rounded-[28px] bg-[#DDD4BD] p-5 h-[190px]">

                <h4 className="text-2xl font-bold text-[#4A5C35]">
                  Small habit,
                  real impact.
                </h4>

                <p className="mt-4 text-[#5C594F]">
                  You prevented 2.4kg of CO₂.
                </p>

              </div>

              <div className="rounded-[28px] bg-[#4A5C35] p-5 h-[190px] text-white">

                <h4 className="text-2xl font-bold">
                  You're in the top tier!
                </h4>

                <p className="mt-4 text-white/70">
                  You waste 35% less than average Singaporeans.
                </p>

              </div>

            </div>

          </div>

        </section>

      </section>

    </main>
  );
}