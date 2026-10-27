/**
 * Validates if an ID conforms to Appwrite Document UID constraints:
 * - Must be at most 36 characters
 * - Valid chars: a-z, A-Z, 0-9, period (.), hyphen (-), underscore (_)
 * - Cannot start with a leading period, hyphen, or underscore
 * - Excludes client-side local IDs ('local_', 'temp_') and mock application slugs ('app_surat_')
 */
export function isValidAppwriteId(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  const trimmed = id.trim();
  if (trimmed.length < 1 || trimmed.length > 36) return false;
  if (trimmed.startsWith('local_') || trimmed.startsWith('temp_') || trimmed.startsWith('app_surat_')) return false;
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(trimmed);
}
