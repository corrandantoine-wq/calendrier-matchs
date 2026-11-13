// Configuration de la connexion à Supabase.
// Ces deux valeurs se trouvent dans Supabase : Project Settings → API.
// La clé « anon » est publique par conception : la sécurité est assurée par les
// règles d'accès de la base (voir supabase/migrations/001_init.sql).
window.CARTE_CLIENTS_CONFIG = {
  supabaseUrl: '',      // ex. 'https://abcdefghijkl.supabase.co'
  supabaseAnonKey: '',  // ex. 'eyJhbGciOi...'
};
