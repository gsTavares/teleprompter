import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'teleprompter',
  webDir: 'dist',
  server: {
    androidScheme: "https",
  }
};

export default config;
