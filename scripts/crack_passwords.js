import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://ultxilauukcosuceucal.supabase.co';
const supabaseKey = 'sb_publishable_Af4vcncFpkrEvlmPcWLNQw_XLaOdhQ1';
const supabase = createClient(supabaseUrl, supabaseKey);

const hashPassword = (pwd) => crypto.createHash('sha256').update(pwd.trim()).digest('hex');

const commonPasswords = [
  '123456', 'password', 'password123', 'admin', 'admin123', '12345678', '123456789', 'test', '123', '1234', '12345', '1234567'
];

async function checkPasswords() {
  const { data } = await supabase.from('student_profiles').select('application_number, password');
  if (!data) return;
  
  const lookup = {};
  for (const pwd of commonPasswords) {
    lookup[hashPassword(pwd)] = pwd;
  }
  
  for (const user of data) {
    if (lookup[user.password]) {
      console.log(`Found password for ${user.application_number}: ${lookup[user.password]}`);
    } else {
      console.log(`Unknown hash/plain text for ${user.application_number}: ${user.password}`);
    }
  }
}

checkPasswords();
