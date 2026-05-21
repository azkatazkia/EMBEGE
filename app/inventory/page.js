"use client";

import { useState } from "react";

const initialItems = [
  {
    id: 1,
    name: "Shrimp",
    emoji: "🍤",
    expiry: "Today",
    quantity: "1 pax left",
    storage: "Fridge",
    addedBy: "Mom",
    dateAdded: "1 week ago",
  },
  {
    id: 2,
    name: "Cucumber",
    emoji: "🥒",
    expiry: "Today",
    quantity: "1 pax left",
    storage: "Fridge",
    addedBy: "Dad",
    dateAdded: "3 days ago",
  },
  {
    id: 3,
    name: "Milk",
    emoji: "🥛",
    expiry: "2 days left",
    quantity: "1 pax left",
    storage: "Fridge",
    addedBy: "You",
    dateAdded: "2 days ago",
  },
  {
    id: 4,
    name: "Spinach",
    emoji: "🥬",
    expiry: "5 days left",
    quantity: "1 pax left",
    storage: "Fridge",
    addedBy: "Mom",
    dateAdded: "Today",
  },
  {
    id: 5,
    name: "Tomato",
    emoji: "🍅",
    expiry: "5 days left",
    quantity: "1 pax left",
    storage: "Fridge",
    addedBy: "Sis",
    dateAdded: "Today",
  },
  {
    id: 6,
    name: "Frozen Shrimp",
    emoji: "🍤",
    expiry: "Today",
    quantity: "1 pax left",
    storage: "Freezer",
    addedBy: "You",
    dateAdded: "1 week ago",
  },
  {
    id: 7,
    name: "Oat Milk",
    emoji: "🥛",
    expiry: "Today",
    quantity: "1 carton left",
    storage: "Pantry",
    addedBy: "Dad",
    dateAdded: "4 days ago",
  },
];

export default function InventoryPage() {
  const [items, setItems] = useState(initialItems);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  function deleteItem(id) {
    setItems(items.filter((item) => item.id !== id));
    setSelectedItem(null);
  }

  function addItem(e) {
    e.preventDefault();

    const form = e.target;

    const newItem = {
      id: Date.now(),
      name: form.name.value,
      emoji: form.emoji.value || "🥫",
      expiry: form.expiry.value,
      quantity: form.quantity.value,
      storage: form.storage.value,
      addedBy: "You",
      dateAdded: "Just now",
    };

    setItems([newItem, ...items]);
    setShowAddForm(false);
    form.reset();
  }

  const fridgeItems = items.filter((item) => item.storage === "Fridge");
  const freezerItems = items.filter((item) => item.storage === "Freezer");
  const pantryItems = items.filter((item) => item.storage === "Pantry");

  return (
    <main className="min-h-screen bg-[#F5EEDC] flex">

      <aside className="m-6 w-[92px] rounded-[32px] bg-black flex flex-col items-center py-8 gap-8">
        <a href="/dashboard" className="text-white text-4xl italic font-bold">
          e
        </a>

        <div className="w-11 h-11 rounded-full bg-[#4A5C35] flex items-center justify-center text-white font-bold">
          B
        </div>

        <div className="flex flex-col items-center gap-6 mt-4 text-white/80 text-2xl">
          <a href="/dashboard">⌂</a>
          <div className="text-white">🗂</div>
          <div>🍴</div>
          <div>🛒</div>
          <a href="/household">👥</a>
          <div>✦</div>
        </div>
      </aside>

      <section className="flex-1 p-10">

        <div className="flex gap-4">
          <div className="w-[520px] h-14 rounded-full bg-[#EAE2CE] px-7 flex items-center justify-between text-[#8A8275] text-lg">
            Search
            <span>⌕</span>
          </div>

          <button className="h-14 rounded-full bg-[#EAE2CE] px-7 text-[#8A8275] text-lg">
            Filter⌄
          </button>

          <button className="h-14 rounded-full bg-[#EAE2CE] px-7 text-[#8A8275] text-lg">
            Sort⌄
          </button>
        </div>

        <div className="mt-6 text-[#8A8275]">
          Dashboard › <span className="text-black font-bold">Inventory</span>
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          Add to Inventory
        </h1>

        <div className="mt-5 flex gap-4">
          <button className="h-16 rounded-[22px] bg-[#EAE2CE] px-8 text-lg font-semibold">
            ✦ Tell Gibrain
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="h-16 rounded-[22px] bg-[#EAE2CE] px-8 text-lg font-semibold"
          >
            ＋ Manual entry
          </button>

          <button className="h-16 rounded-[22px] bg-[#EAE2CE] px-8 text-lg font-semibold">
            ⛶ Scan Receipt
          </button>

          <button className="h-16 rounded-[22px] bg-[#EAE2CE] px-8 text-lg font-semibold">
            ▯ Photo of fridge
          </button>
        </div>

        <InventorySection title="Fridge" items={fridgeItems} onSelect={setSelectedItem} />
        <InventorySection title="Freezer" items={freezerItems} onSelect={setSelectedItem} />
        <InventorySection title="Pantry" items={pantryItems} onSelect={setSelectedItem} />

        <button className="fixed bottom-8 right-10 h-16 rounded-full bg-[#FBF8EF] px-10 shadow-lg font-bold">
          ✦ Ask Gibrain 2.3
        </button>

      </section>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={deleteItem}
        />
      )}

      {showAddForm && (
        <AddItemModal
          onClose={() => setShowAddForm(false)}
          onAdd={addItem}
        />
      )}

    </main>
  );
}

function InventorySection({ title, items, onSelect }) {
  return (
    <section className="mt-9">
      <h2 className="text-4xl font-bold mb-6">
        {title}
      </h2>

      <div className="grid grid-cols-5 gap-5">
        {items.map((item) => (
          <InventoryCard
            key={item.id}
            item={item}
            onClick={() => onSelect(item)}
          />
        ))}
      </div>
    </section>
  );
}

function InventoryCard({ item, onClick }) {
  const urgent = item.expiry === "Today";

  return (
    <button
      onClick={onClick}
      className="text-left rounded-[28px] bg-[#EAE2CE] p-6 min-h-[150px] relative hover:shadow-md transition"
    >
      <div className="absolute top-5 right-5 w-8 h-8 rounded-full border border-black/20 flex items-center justify-center text-[#8A8275]">
        ✓
      </div>

      <h3 className="text-xl font-bold">
        {item.name}
      </h3>

      <div className="mt-5 flex items-center gap-4">
        <div className="text-6xl">
          {item.emoji}
        </div>

        <div>
          <div
            className={`inline-flex rounded-full px-4 py-1 text-sm font-semibold ${
              urgent
                ? "bg-[#4A5C35] text-[#F5EEDC]"
                : "bg-[#9DB07A] text-white"
            }`}
          >
            {urgent ? "Expires Today" : item.expiry}
          </div>

          <div className="mt-1 rounded-full bg-[#DDD4BD] px-4 py-1 text-sm text-[#5C594F]">
            {item.quantity}
          </div>

          <div className="mt-1 rounded-full bg-[#DDD4BD] px-4 py-1 text-sm text-[#5C594F]">
            Cook tonight
          </div>
        </div>
      </div>
    </button>
  );
}

function ItemModal({ item, onClose, onDelete }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">

      <div className="w-[760px] rounded-[28px] bg-[#F5EEDC] p-12 relative shadow-xl">

        <button
          onClick={onClose}
          className="absolute top-8 right-10 text-3xl text-[#8A8275]"
        >
          —
        </button>

        <div className="text-7xl mb-6">
          {item.emoji}
        </div>

        <h2 className="text-4xl font-bold">
          {item.name}
        </h2>

        <div className="mt-4 inline-flex rounded-full bg-white/50 px-5 py-2 text-[#5C594F]">
          ✦ Cook tonight for 4-person meal and you won’t waste anything!
        </div>

        <div className="mt-8 grid gap-4 max-w-md">
          <InfoRow label="Expiry date" value={item.expiry} highlight />
          <InfoRow label="Quantity" value={item.quantity} />
          <InfoRow label="Storage" value={item.storage} />
          <InfoRow label="Added by" value={item.addedBy} />
          <InfoRow label="Date Added" value={item.dateAdded} />
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6">

          <button className="h-16 rounded-full bg-[#DDD4BD] text-lg font-semibold">
            Find Recipe
          </button>

          <button className="h-16 rounded-full bg-[#DDD4BD] text-lg font-semibold">
            Freeze
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="h-16 rounded-full bg-[#4A5C35] text-[#F5EEDC] text-lg font-semibold"
          >
            Used up
          </button>

        </div>

      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="grid grid-cols-2 items-center">
      <span>{label}</span>
      <span
        className={`w-fit rounded-full px-4 py-1 text-sm ${
          highlight
            ? "bg-[#4A5C35] text-[#F5EEDC]"
            : "bg-[#DDD4BD] text-[#5C594F]"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function AddItemModal({ onClose, onAdd }) {
  return (
    <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-50">

      <div className="w-[560px] rounded-[28px] bg-[#F5EEDC] p-10 shadow-xl">

        <h2 className="text-4xl font-bold">
          Add food item
        </h2>

        <p className="mt-3 text-[#5C594F]">
          Manually add an item to your household inventory.
        </p>

        <form
          onSubmit={onAdd}
          className="mt-8 grid gap-4"
        >
          <input
            name="name"
            required
            placeholder="Food name"
            className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
          />

          <input
            name="emoji"
            placeholder="Emoji e.g. 🍤"
            className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
          />

          <input
            name="expiry"
            required
            placeholder="Expiry e.g. Today / 2 days left"
            className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
          />

          <input
            name="quantity"
            required
            placeholder="Quantity e.g. 1 pax left"
            className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
          />

          <select
            name="storage"
            className="h-12 rounded-xl bg-[#DDD4BD] px-4 outline-none"
          >
            <option>Fridge</option>
            <option>Freezer</option>
            <option>Pantry</option>
          </select>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-12 rounded-xl bg-[#DDD4BD] font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="h-12 rounded-xl bg-[#6E8551] text-[#F5EEDC] font-semibold"
            >
              Add item
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}