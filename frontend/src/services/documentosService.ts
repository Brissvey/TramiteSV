import type { Documento, DocumentoPayload } from '../types/documento';

const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const API_URL = viteEnv?.VITE_API_URL
  ? `${viteEnv.VITE_API_URL}/documentos`
  : 'http://localhost:3003/documentos';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('tramitesv_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function manejarRespuesta<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let mensaje = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      mensaje = errorData.message || mensaje;
    } catch {
      // Ignorar si no hay cuerpo JSON
    }
    throw new Error(Array.isArray(mensaje) ? mensaje.join(', ') : mensaje);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const documentosService = {
  async obtenerTodos(): Promise<Documento[]> {
    const res = await fetch(API_URL, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return manejarRespuesta<Documento[]>(res);
  },

  async crear(payload: DocumentoPayload): Promise<Documento> {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return manejarRespuesta<Documento>(res);
  },

  async actualizar(id: number, payload: DocumentoPayload): Promise<Documento> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return manejarRespuesta<Documento>(res);
  },

  async eliminar(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return manejarRespuesta<void>(res);
  },
};