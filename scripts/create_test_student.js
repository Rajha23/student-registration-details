import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://ultxilauukcosuceucal.supabase.co';
const supabaseKey = 'sb_publishable_Af4vcncFpkrEvlmPcWLNQw_XLaOdhQ1';
const supabase = createClient(supabaseUrl, supabaseKey);

const hashPassword = (pwd) => crypto.createHash('sha256').update(pwd.trim()).digest('hex');

async function createTestStudent() {
  const appNumber = '112233';
  const password = 'testpassword';
  const hashedPassword = hashPassword(password);

  console.log(`Creating test student: ${appNumber} / ${password}`);

  // Delete if exists
  await supabase.from('student_profiles').delete().eq('application_number', appNumber);

  const { data, error } = await supabase.from('student_profiles').insert({
    id: crypto.randomUUID(),
    application_number: appNumber,
    name: 'Test Student',
    email: 'test@example.com',
    mobile_number: '9999999999',
    course: 'B.E',
    department: 'Computer Science',
    password: hashedPassword
  }).select();

  if (error) {
    console.error("Error creating test student:", error);
  } else {
    console.log("Created successfully:", data);
  }
}

createTestStudent();
