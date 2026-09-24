// Server-only encrypted storage of per-user connection keys.
import { createClient } from "npm:@supabase/supabase-js@2";

export function adminClient() {
  return createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
}

async function key(): Promise<CryptoKey> {
  const raw = Deno.env.get("APP_USER_CONNECTION_KEY_SECRET");
  if (!raw) throw new Error("APP_USER_CONNECTION_KEY_SECRET is not set");
  return crypto.subtle.importKey("raw", Uint8Array.from(atob(raw), (c) => c.charCodeAt(0)), "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encrypt(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await key(), new TextEncoder().encode(plaintext)));
  const buf = new Uint8Array(iv.length + ct.length);
  buf.set(iv);
  buf.set(ct, iv.length);
  return btoa(String.fromCharCode(...buf));
}

async function decrypt(stored: string): Promise<string> {
  const buf = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: buf.subarray(0, 12) }, await key(), buf.subarray(12));
  return new TextDecoder().decode(pt);
}

export async function saveConnectionKeyForUser(userId: string, connectorId: string, connectionAPIKey: string, accountEmail?: string | null) {
  const { error } = await adminClient().from("app_user_connections").upsert(
    {
      user_id: userId,
      connector_id: connectorId,
      connection_key_ciphertext: await encrypt(connectionAPIKey),
      account_email: accountEmail ?? null,
      reconnect_required: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,connector_id" },
  );
  if (error) throw error;
}

export async function getConnectionForUser(userId: string, connectorId: string) {
  const { data, error } = await adminClient()
    .from("app_user_connections")
    .select("connection_key_ciphertext, account_email, reconnect_required")
    .eq("user_id", userId)
    .eq("connector_id", connectorId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { key: await decrypt(data.connection_key_ciphertext), email: data.account_email as string | null, reconnectRequired: data.reconnect_required as boolean };
}

export async function setReconnectRequired(userId: string, connectorId: string) {
  await adminClient().from("app_user_connections").update({ reconnect_required: true }).eq("user_id", userId).eq("connector_id", connectorId);
}

export async function deleteConnectionForUser(userId: string, connectorId: string) {
  const { error } = await adminClient().from("app_user_connections").delete().eq("user_id", userId).eq("connector_id", connectorId);
  if (error) throw error;
}
