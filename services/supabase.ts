import { Platform } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
const BUCKET = process.env.EXPO_PUBLIC_SUPABASE_BUCKET ?? 'ada-images';

export async function uploadImage(localUri: string, storagePath: string): Promise<string> {
  const filename = storagePath.split('/').pop() ?? 'image.jpg';
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // On web, localUri is a blob: or data: URL — fetch it to get a Blob
    const response = await fetch(localUri);
    const blob = await response.blob();
    formData.append('file', blob, filename);
  } else {
    // On native, React Native's FormData accepts the { uri, name, type } shape
    formData.append('file', { uri: localUri, name: filename, type: 'image/jpeg' } as any);
  }

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${ANON_KEY}`,
      'x-upsert': 'true',
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Image upload failed: ${text}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
}
