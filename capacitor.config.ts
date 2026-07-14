import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medicalertrd.app',
  appName: 'MedicAlertRD',
  webDir: 'www',
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_medicalert',
      iconColor: '#0D3B8E',
      sound: 'beep.wav',
      // Canales Android (Android 8+)
      channels: [
        {
          id: 'medicamentos',
          name: 'Medicamentos',
          description: 'Alarmas para tomar medicamentos',
          importance: 5,       // IMPORTANCE_HIGH — aparece como heads-up
          visibility: 1,       // VISIBILITY_PUBLIC
          vibration: true,
          lights: true,
          lightColor: '#0D3B8E',
          sound: 'beep.wav'
        },
        {
          id: 'citas',
          name: 'Citas médicas',
          description: 'Recordatorios de citas médicas',
          importance: 4,       // IMPORTANCE_DEFAULT
          visibility: 1,
          vibration: true,
          lights: true,
          lightColor: '#0FA3B1'
        }
      ]
    }
  }
};

export default config;
