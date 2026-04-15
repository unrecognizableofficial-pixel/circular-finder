import { cookies } from "next/headers";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey);
}

export function createSupabaseBrowser() {
  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }
  return createBrowserClient(url, anonKey);
}

export async function createSupabaseServer() {
  if (!url || !anonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // Server layouts can read auth cookies but should not mutate them directly.
      },
      remove() {
        // Route handlers and server actions should own cookie mutation.
      }
    }
  });
}
