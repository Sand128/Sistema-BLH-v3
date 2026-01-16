import { User } from '../types';

interface LoginResponse {
  token: string;
  user: User;
}

/**
 * Servicio de Autenticación
 * Simula la comunicación con el backend (Laravel API)
 */
export const authService = {
  /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   * @param user Usuario (formato correo o 'admin')
   * @param password Contraseña
   */
  login: async (user: string, password: string): Promise<LoginResponse> => {
    // CONECTAR CON API LARAVEL AQUÍ EN FASE 2
    // Ejemplo: return axios.post('/api/login', { user, password });

    return new Promise((resolve, reject) => {
      // Simular latencia de red (Spinner)
      setTimeout(() => {
        // Credenciales Hardcoded para la Demo
        // Usuario: admin (o admin@blh.com) / Pass: leche2025
        if ((user === 'admin' || user === 'admin@blh.com') && password === 'leche2025') {
          
          const mockUser: User = {
            id: 'u-admin-001',
            fullName: 'Administradora Lactancia',
            email: 'coordinacion@lactancia.edomex.gob.mx',
            hospitalId: 'H-CENTRAL',
            hospitalName: 'Coordinación Estatal de Lactancia',
            roles: ['admin'],
            status: 'ACTIVE',
            twoFactorEnabled: false,
            lastLogin: new Date().toISOString()
          };

          const mockToken = 'b64-mock-token-' + Date.now();

          // Persistencia de sesión (Simulación)
          localStorage.setItem('blh_token', mockToken);
          localStorage.setItem('blh_user', JSON.stringify(mockUser));

          resolve({
            token: mockToken,
            user: mockUser
          });
        } else {
          reject(new Error('Credenciales incorrectas. Verifique usuario y contraseña.'));
        }
      }, 1500); // 1.5 segundos de carga simulada
    });
  },

  logout: () => {
    localStorage.removeItem('blh_token');
    localStorage.removeItem('blh_user');
    localStorage.removeItem('blh_session'); // Legacy support for App.tsx
  }
};
