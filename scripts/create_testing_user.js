import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://ultxilauukcosuceucal.supabase.co';
const supabaseKey = 'sb_publishable_Af4vcncFpkrEvlmPcWLNQw_XLaOdhQ1';
const supabase = createClient(supabaseUrl, supabaseKey);

const hashPassword = (pwd) => crypto.createHash('sha256').update(pwd.trim()).digest('hex');

async function createTestUser() {
  const appNumber = 'TESTING';
  const password = 'password123';
  const hashedPassword = hashPassword(password);

  console.log(`Creating test student: ${appNumber} / ${password}`);

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
  });

  if (error) {
    console.error("Error creating test student:", error);
  } else {
    console.log("Created successfully!");
  }
}

createTestUser();
