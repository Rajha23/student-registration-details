import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ultxilauukcosuceucal.supabase.co';
const supabaseKey = 'sb_publishable_Af4vcncFpkrEvlmPcWLNQw_XLaOdhQ1';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
  const { data, error } = await supabase.from('student_profiles').select('application_number');
  
  if (error) {
    console.error("Error:", error);
    return;
  }
  
  const counts = {};
  for (const row of data) {
    counts[row.application_number] = (counts[row.application_number] || 0) + 1;
  }
  
  const duplicates = Object.keys(counts).filter(app => counts[app] > 1);
  if (duplicates.length > 0) {
    console.log("Found duplicates for application numbers:", duplicates);
  } else {
    console.log("No duplicates found.");
  }
}

checkDuplicates();
