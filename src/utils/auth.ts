export const hashPassword = async (pwd: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pwd);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};
