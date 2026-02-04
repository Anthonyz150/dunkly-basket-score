import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-client@2"

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // On cherche les matchs qui débutent dans environ 30 minutes
  const now = new Date();
  const in35Mins = new Date(now.getTime() + 35 * 60000).toISOString();
  const in25Mins = new Date(now.getTime() + 25 * 60000).toISOString();
  
  const { data: matchs } = await supabase
    .from('matchs')
    .select('*')
    .eq('status', 'a-venir')
    .gte('date', in25Mins)
    .lte('date', in35Mins);

  if (matchs && matchs.length > 0) {
    for (const match of matchs) {
      await fetch("https://onesignal.com/api/v1/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Basic TA_REST_API_KEY_GENEREE" // <--- TA CLÉ ICI
        },
        body: JSON.stringify({
          app_id: "a60eae06-8739-4515-8827-858c2ec0c07b",
          included_segments: ["All"],
          contents: { "fr": `🏀 Match imminent : ${match.clubA} vs ${match.clubB} !` },
          headings: { "fr": "DUNKLY" }
        })
      });
    }
  }

  return new Response(JSON.stringify({ message: "Scan effectué" }), { 
    headers: { "Content-Type": "application/json" } 
  });
})