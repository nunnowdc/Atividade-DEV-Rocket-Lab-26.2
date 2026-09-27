// Cliente HTTP genérico: monta a URL, envia JSON e transforma respostas de
// erro em exceções com a mensagem vinda da API.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json()
    // O FastAPI devolve "detail" como texto (404) ou como lista de erros (422).
    if (typeof body.detail === 'string') return body.detail
    if (Array.isArray(body.detail)) return 'Dados inválidos. Confira os campos.'
  } catch {
    // Resposta sem JSON: usa a mensagem padrão abaixo.
  }
  return `Erro ${response.status} ao falar com a API`
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  // Só declara JSON quando há corpo (POST/PUT). Num GET, esse cabeçalho faria o
  // navegador mandar antes uma requisição extra de verificação (preflight CORS).
  if (init?.body) headers.set('Content-Type', 'application/json')

  const response = await fetch(`${API_URL}${path}`, { ...init, headers })

  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response))
  }
  if (response.status === 204) {
    return undefined as T
  }
  return response.json() as Promise<T>
}
