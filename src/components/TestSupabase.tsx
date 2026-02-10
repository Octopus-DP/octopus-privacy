import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

export function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [clients, setClients] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('loading')
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .limit(5)

      if (error) throw error

      setClients(data || [])
      setStatus('success')
    } catch (err: any) {
      console.error('Test error:', err)
      setError(err.message)
      setStatus('error')
    }
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Test de connexion Supabase
          {status === 'loading' && <Badge>Chargement...</Badge>}
          {status === 'success' && <Badge className="bg-green-600">✅ Connexion OK</Badge>}
          {status === 'error' && <Badge variant="destructive">❌ Erreur</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {status === 'success' && (
          <div>
            <p className="text-green-600 font-semibold mb-2">
              ✅ Connexion réussie à PostgreSQL !
            </p>
            <p className="text-sm text-gray-600 mb-2">
              {clients.length} client(s) trouvé(s) :
            </p>
            <ul className="text-sm space-y-1">
              {clients.map((client) => (
                <li key={client.id}>
                  • {client.name} ({client.code})
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600">
            <p className="font-semibold">❌ Erreur de connexion</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        )}
        
        {status === 'loading' && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Test en cours...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}