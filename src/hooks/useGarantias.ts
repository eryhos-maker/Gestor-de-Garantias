import { useState, useEffect } from 'react';
import { Garantia } from '../types';

// ==========================================
// CONFIGURACIÓN DE CONEXIÓN A GOOGLE SHEETS
// ==========================================
// 1. Cambia esto a `true` cuando tengas tu URL de SheetDB
const USE_REAL_API = true; 

// 2. Pega aquí la URL que te dé SheetDB (ej. https://sheetdb.io/api/v1/tu_codigo)
const API_URL = "https://sheetdb.io/api/v1/9p0cmh327mkzb"; 
// ==========================================

const STORAGE_KEY = 'garantias_db';

export function useGarantias() {
  const [garantias, setGarantias] = useState<Garantia[]>([]);

  // Cargar datos locales (Solo si no usamos la API real)
  useEffect(() => {
    if (!USE_REAL_API) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setGarantias(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing stored garantias', e);
        }
      }
    }
  }, []);

  // Guardar datos locales (Solo si no usamos la API real)
  useEffect(() => {
    if (!USE_REAL_API) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(garantias));
    }
  }, [garantias]);

  const registrarGarantia = async (nuevaGarantia: Garantia) => {
    if (USE_REAL_API) {
      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [nuevaGarantia] }) // Formato de SheetDB
        });
        if (!response.ok) throw new Error('Error al guardar en Google Sheets');
      } catch (error) {
        console.error(error);
        throw new Error('No se pudo conectar con la base de datos.');
      }
    } else {
      // Simulación local
      setGarantias(prev => {
        if (prev.some(g => g.folio === nuevaGarantia.folio)) {
          throw new Error('El folio ya existe');
        }
        return [...prev, nuevaGarantia];
      });
    }
  };

  const actualizarEstatus = async (folio: string, actualizaciones: Partial<Garantia>) => {
    if (USE_REAL_API) {
      try {
        // SheetDB usa PATCH a la URL /folio/VALOR_DEL_FOLIO
        const response = await fetch(`${API_URL}/folio/${folio}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: actualizaciones })
        });
        if (!response.ok) throw new Error('Error al actualizar en Google Sheets');
      } catch (error) {
        console.error(error);
        throw new Error('No se pudo actualizar la base de datos.');
      }
    } else {
      // Simulación local
      setGarantias(prev => 
        prev.map(g => g.folio === folio ? { ...g, ...actualizaciones } : g)
      );
    }
  };

  const buscarPorFolio = async (folio: string): Promise<Garantia | undefined> => {
    if (USE_REAL_API) {
      try {
        // SheetDB usa GET a la URL /search?folio=VALOR
        const response = await fetch(`${API_URL}/search?folio=${folio}`);
        if (!response.ok) throw new Error('Error al buscar en Google Sheets');
        const data = await response.json();
        
        // SheetDB devuelve un arreglo de resultados
        if (data && data.length > 0) {
          return data[0] as Garantia;
        }
        return undefined;
      } catch (error) {
        console.error(error);
        throw new Error('No se pudo conectar con la base de datos para buscar.');
      }
    } else {
      // Simulación local
      return garantias.find(g => g.folio === folio);
    }
  };

  return {
    garantias,
    registrarGarantia,
    actualizarEstatus,
    buscarPorFolio
  };
}
