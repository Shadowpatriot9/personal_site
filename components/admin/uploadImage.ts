// Shared client helpers for the admin image-upload endpoint.

export const uploadImage = async (
  file: Blob,
  token: string,
  filename = 'image.png',
): Promise<string> => {
  const name = (file as File).name || filename;
  const body = new FormData();
  body.append('file', file, name);
  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Upload failed');
  }
  const data = await res.json();
  return data.url as string;
};

// Whether the server can persist uploads (Blob store connected, or local dev).
export const checkUploadsEnabled = async (token: string): Promise<boolean> => {
  try {
    const res = await fetch('/api/admin/upload', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data.enabled);
  } catch {
    return false;
  }
};
