export type GoogleProfile = {
  name: string;
  email: string;
  picture?: string;
  sub: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type GoogleAccounts = {
  oauth2: {
    initTokenClient: (config: {
      client_id: string;
      scope: string;
      callback: (response: { access_token?: string; error?: string; error_description?: string }) => void;
      error_callback?: (error: { type?: string; message?: string }) => void;
    }) => GoogleTokenClient;
  };
};

declare global {
  interface Window {
    google?: { accounts: GoogleAccounts };
  }
}

function getGoogleClientId(): string {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
}

function waitForGoogleScript(timeoutMs = 8000): Promise<GoogleAccounts> {
  return new Promise((resolve, reject) => {
    const existing = window.google?.accounts;
    if (existing?.oauth2) {
      resolve(existing);
      return;
    }

    const started = Date.now();
    const timer = window.setInterval(() => {
      const accounts = window.google?.accounts;
      if (accounts?.oauth2) {
        window.clearInterval(timer);
        resolve(accounts);
        return;
      }
      if (Date.now() - started > timeoutMs) {
        window.clearInterval(timer);
        reject(new Error('No se pudo cargar Google Identity Services. Revisá tu conexión e intentá de nuevo.'));
      }
    }, 100);
  });
}

async function fetchGoogleProfile(accessToken: string): Promise<GoogleProfile> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error('No se pudo obtener el perfil de Google.');
  }

  const data = await res.json();
  if (!data.email) {
    throw new Error('La cuenta de Google no devolvió un email.');
  }

  return {
    name: data.name || data.email.split('@')[0],
    email: data.email,
    picture: data.picture,
    sub: data.sub || data.email
  };
}

/**
 * Opens the real Google account picker and returns the selected profile.
 * Requires VITE_GOOGLE_CLIENT_ID (OAuth Web Client ID) in .env
 */
export async function signInWithGoogleAccount(): Promise<GoogleProfile> {
  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error(
      'Falta VITE_GOOGLE_CLIENT_ID en el archivo .env. Creá un OAuth Client ID (tipo Web) en Google Cloud Console y agregalo ahí.'
    );
  }

  const accounts = await waitForGoogleScript();

  return new Promise((resolve, reject) => {
    const tokenClient = accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: async (response) => {
        if (response.error || !response.access_token) {
          reject(
            new Error(
              response.error_description ||
                response.error ||
                'Inicio de sesión con Google cancelado o fallido.'
            )
          );
          return;
        }

        try {
          const profile = await fetchGoogleProfile(response.access_token);
          resolve(profile);
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      },
      error_callback: (error) => {
        reject(new Error(error?.message || 'No se pudo abrir el login de Google.'));
      }
    });

    // Forces the account chooser every time (phone + laptop)
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  });
}
