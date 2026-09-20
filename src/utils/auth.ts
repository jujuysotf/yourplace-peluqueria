import { ClientUser } from '../types';

const STORAGE_KEY = 'yourplace_client_user';

export function getStoredClientUser(): ClientUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveClientUser(user: ClientUser): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Could not save user to localStorage', err);
  }
}

export function removeClientUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear user', err);
  }
}

/**
 * Parses Google GSI credential JWT (id_token) safely without external libraries
 */
export function parseGoogleJwt(credential: string): { name: string; email: string; picture?: string; sub: string } | null {
  try {
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding Google JWT token', e);
    return null;
  }
}

/**
 * Creates or updates user from Google profile
 */
export function createGoogleClientUser(profile: { name: string; email: string; picture?: string; sub?: string }): ClientUser {
  const user: ClientUser = {
    id: profile.sub || 'google-' + Date.now(),
    name: profile.name,
    email: profile.email,
    avatar: profile.picture,
    provider: 'google'
  };
  saveClientUser(user);
  return user;
}

/**
 * Creates guest session
 */
export function createGuestClientUser(name: string = 'Invitada', email: string = ''): ClientUser {
  const user: ClientUser = {
    id: 'guest-' + Date.now(),
    name: name.trim() || 'Invitada',
    email: email.trim(),
    provider: 'guest'
  };
  saveClientUser(user);
  return user;
}
