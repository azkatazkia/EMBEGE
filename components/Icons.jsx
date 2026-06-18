"use client";

import {
  Home, Package, Utensils, ShoppingCart, Users, Sparkles,
  Search, Plus, Filter, Bell, ArrowUpRight, ArrowRight, ArrowLeft,
  ChevronRight, ChevronDown, Send, Scan, Pencil, Trash2,
  Refrigerator, Snowflake, LayoutGrid, Camera, Check, Clock,
  Leaf, X, Copy, LogOut, Receipt, Soup, FileUp
} from "lucide-react";


function wrap(LucideIcon) {
  return function WrappedIcon({ stroke, ...props }) {
    return <LucideIcon color={stroke} {...props} />;
  };
}

export const I = {
  home:         wrap(Home),
  box:          wrap(Package),
  utensils:     wrap(Utensils),
  cart:         wrap(ShoppingCart),
  users:        wrap(Users),
  sparkle:      wrap(Sparkles),
  search:       wrap(Search),
  plus:         wrap(Plus),
  filter:       wrap(Filter),
  bell:         wrap(Bell),
  arrowOut:     wrap(ArrowUpRight),
  arrowRight:   wrap(ArrowRight),
  arrowLeft:    wrap(ArrowLeft),
  chevronRight: wrap(ChevronRight),
  chevronDown:  wrap(ChevronDown),
  send:         wrap(Send),
  scan:         wrap(Scan),
  pencil:       wrap(Pencil),
  trash:        wrap(Trash2),
  fridge:       wrap(Refrigerator),
  freezer:      wrap(Snowflake),
  pantry:       wrap(LayoutGrid),
  camera:       wrap(Camera),
  check:        wrap(Check),
  clock:        wrap(Clock),
  leaf:         wrap(Leaf),
  x:            wrap(X),
  copy:         wrap(Copy),
  logout:       wrap(LogOut),
  receipt:      wrap(Receipt),
  bowl:         wrap(Soup),
  upload:       wrap(FileUp),
  eai:          () => <img src="/eai-logo.png" alt="e-ai" className="w-6 h-6" />
  upload:       wrap(FileUp)
};

export function Logo({ size = 28, invert = false }) {
  return (
    <img
      src="/embege-logo.png"
      width={size}
      height={size}
      alt="Embege"
      aria-label="Embege"
      style={{
        objectFit: "contain",
        filter: invert ? "invert(1)" : "none",
      }}
    />
  );
}
