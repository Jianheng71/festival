import { createClient } from '@supabase/supabase-js';
export type Festival = { id: string; date: string; name: string; tag: string; copy: string; image_url: string | null; created_at?: string; };
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
