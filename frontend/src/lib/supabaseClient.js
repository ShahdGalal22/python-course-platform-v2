// Client-side Supabase instance, using the public "anon" key only.
// This is safe to ship to the browser — Row Level Security (see
// database/schema.sql) decides what the anon key is actually allowed to
// read or write, not this key's secrecy.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. Copy .env.example to .env and fill in your Supabase project details."
  );
}

export const supabase = createClient(url, anonKey);
