import { ConsentimientoFormData, ConsentimientoResponse } from '../types/extended-types';

// Mock Service simulation since we don't have a real backend yet
class ConsentimientoService {
  
  // Verificar si donadora tiene consentimiento vigente
  async verificarConsentimientoVigente(donorId: string): Promise<boolean> {
    // Simulación: En producción esto llamaría a la API
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock logic: return true randomly or based on specific ID for testing
        resolve(Math.random() > 0.5); 
      }, 500);
    });
  }
  
  // Registrar nuevo consentimiento
  async registrarConsentimiento(data: ConsentimientoFormData): Promise<ConsentimientoResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const today = new Date();
        const expiration = new Date(today);
        expiration.setMonth(expiration.getMonth() + 6);

        resolve({
          id: `CONS-${Date.now()}`,
          donadoraId: data.donadoraId,
          pdfUrl: '#',
          firmaUrl: data.firmaDigital ? URL.createObjectURL(data.firmaDigital) : '',
          fechaRegistro: today.toISOString(),
          validoHasta: expiration.toISOString(),
          estado: 'VIGENTE'
        });
      }, 1500);
    });
  }
  
  // Generar PDF de consentimiento (Simulación)
  async generarPdfConsentimiento(donorId: string): Promise<Blob> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = `
**CONSENTIMIENTO INFORMADO PARA LA DONACIÓN DE LECHE MATERNA**

1. **Unidad Médica**: __________________________________________________
2. **Fecha**: ____________________

Con fundamento en la Ley General de Salud, y en la Ley para la Protección, Apoyo y Promoción a la Lactancia Materna del Estado de México.

La que suscribe **3/ Sra.** ____________________________________________________ en forma voluntaria y sin ninguna presión o inducción consiento donar una o varias muestras de leche materna y consiento en que la muestra que estoy donando sea usada con el propósito de alimentar a otros niños que así lo requieran, o investigación científica **4/ si: ___ no: ___**.

Entiendo el método para la extracción de leche materna, conservación, transporte y en caso de no acudir directamente al banco de leche humana o lactario hospitalario, me la extraeré de forma manual siguiendo estrictamente las instrucciones que me sean dadas antes de cada donación y la proporcionaré el día y la hora acordada.

Una vez que esté participando como donante, reportaré todo cambio en mi estado de salud, especialmente en lo referente a enfermedades de transmisión sexual, hepatitis o alguna otra enfermedad; así mismo acepto realizarme los exámenes de laboratorio que sean requeridos para que pueda ser donante.

Entiendo que puedo terminar mi participación como donante en cualquier momento, con la apropiada notificación y acepto que puedo ser excluida como donante de leche humana de un momento a otro.

Me comprometo a acudir a la consulta de control nutricional para mi bebé(s) y para mí, de forma periódica, con la finalidad de mantener nuestro estado de bienestar.

Consiento ser contactada periódicamente aun después de haber donado leche, con el fin de proveer información referente a la donación.

No tendré ningún gasto, ni recibiré remuneración económica alguna por la donación de mi leche. Se guardará estricta confidencialidad sobre los datos obtenidos producto de la colaboración.

Me comprometo a tener informado al banco de leche humana o lactario hospitalario de los cambios de domicilio. Declaro que la información contenida en este documento me ha sido explicada de forma clara y precisa, aclarando cualquier duda con respuestas satisfactorias por parte del personal. Con mi firma o huella digital declaro en este documento que se me ha brindado la información correcta y que me encuentro en las condiciones que se describen para todos los efectos legales que correspondan.

---

**Firmas:**

**Donadora**
Nombre y Firma: ________________________

**Personal de Salud Responsable del Registro**
Nombre y Firma: ________________________
`;
        // We use text/plain for the mock so it can be easily read in a browser if opened, 
        // even though it will be downloaded with a .pdf extension by the component.
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        resolve(blob);
      }, 1000);
    });
  }
}

export const consentimientoService = new ConsentimientoService();