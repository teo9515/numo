import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        // CORRECCIÓN: Definimos el tipo completo en lugar de usar 'any'
        setAll(cookiesToSet: { 
          name: string
          value: string
          options: {
            path?: string
            domain?: string
            maxAge?: number
            expires?: Date | number
            httpOnly?: boolean
            secure?: boolean
            sameSite?: 'lax' | 'strict' | 'none'
            priority?: 'low' | 'medium' | 'high'
          }
        }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // El método `setAll` fue llamado desde un Componente de Servidor.
            // Esto se puede ignorar si tienes un middleware refrescando
            // las sesiones de usuario.
          }
        },
      },
    }
  )
}