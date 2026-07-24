import "server-only";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

const BUCKET = "reports";

let _client: ReturnType<typeof createClient> | null = null;
function getClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error("Supabase storage credentials missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  }
  if (!_client) {
    _client = createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey);
  }
  return _client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Uploads a file to Supabase Storage (replaces Manus's storage proxy).
 * Returns the storage key and a public URL for the uploaded object.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);

  const body = typeof data === "string" ? Buffer.from(data) : data;

  const { error } = await client.storage.from(BUCKET).upload(key, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    throw new Error(`Storage upload failed for ${key}: ${error.message}`);
  }

  const { data: publicUrlData } = client.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: publicUrlData.publicUrl };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const client = getClient();
  const key = normalizeKey(relKey);
  const { data } = client.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}
