import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'ExamenBimestral1',
  webDir: 'www',
  server: {
    androidScheme: 'https',
    allowNavigation: ['api.cloudinary.com']  // ← ESTO ES CLAVE
  }
};

export default config;
