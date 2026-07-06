import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';
import { hashPassword } from '../utils/auth';

const DEGREE_OPTIONS = [
  { value: 'B.E', label: 'B.E' },
  { value: 'B.Tech', label: 'B.Tech' },
  { value: 'M.E', label: 'M.E' },
  { value: 'MBA', label: 'MBA' }
];

const DEPARTMENT_MAP: Record<string, { value: string, label: string }[]> = {
  'B.E': [
    { value: 'B.E CIVIL ENGINEERING', label: 'B.E CIVIL ENGINEERING' },
    { value: 'B.E ELECTRONICS AND COMMUNICATION ENGINEERING', label: 'B.E ELECTRONICS AND COMMUNICATION ENGINEERING' },
    { value: 'B.E ELECTRICAL AND ELECTRONICS ENGINEERING', label: 'B.E ELECTRICAL AND ELECTRONICS ENGINEERING' },
    { value: 'B.E COMPUTER SCIENCE AND ENGINEERING', label: 'B.E COMPUTER SCIENCE AND ENGINEERING' },
    { value: 'B.E MECHANICAL ENGINEERING', label: 'B.E MECHANICAL ENGINEERING' },
    { value: 'B.E CSE (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)', label: 'B.E CSE (ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING)' }
  ],
  'B.Tech': [
    { value: 'B.TECH (INFORMATION TECHNOLOGY)', label: 'B.TECH (INFORMATION TECHNOLOGY)' },
    { value: 'B.TECH ARTIFICIAL INTELLIGENCE AND DATA SCIENCE', label: 'B.TECH ARTIFICIAL INTELLIGENCE AND DATA SCIENCE' }
  ],
  'M.E': [
    { value: 'M.E Thermal Engineering', label: 'M.E Thermal Engineering' },
    { value: 'M.E VLSI Design', label: 'M.E VLSI Design' }
  ],
  'MBA': [
    { value: 'MBA', label: 'MBA' }
  ]
};

export const StudentAccess = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Form State
  const [appNumber, setAppNumber] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Only
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [course, setCourse] = useState('');
  const [department, setDepartment] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');



  const [quota, setQuota] = useState('Government');


  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Read directly from FormData to avoid React state autofill bugs
    const formData = new FormData(e.currentTarget);
    const actualQuota = (formData.get('quota') as string) || quota;
    let actualAppNumber = (formData.get('appNumber') as string) || appNumber;
    const actualPassword = ((formData.get('password') as string) || password).trim();
    const actualConfirm = ((formData.get('confirmPassword') as string) || confirmPassword).trim();
    
    if (!actualAppNumber.trim() || !actualPassword) return;

    if (actualQuota === 'Management') {
      if (!/^\d{5}$/.test(actualAppNumber.trim())) {
        setErrorMsg('Management Quota application number must be exactly 5 digits');
        return;
      }
      actualAppNumber = `TRP2026/${actualAppNumber.trim()}`;
    } else {
      if (!/^\d{6}$/.test(actualAppNumber.trim())) {
        // Also check if it's the legacy test user to avoid locking admin out of testing
        if (actualAppNumber.trim() !== 'TESTING' && actualAppNumber.trim() !== '987654' && actualAppNumber.trim() !== '123456') {
          setErrorMsg('Government Quota application number must be exactly 6 digits');
          return;
        }
      }
      actualAppNumber = actualAppNumber.trim();
    }
    
    if (!isLogin && actualPassword !== actualConfirm) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
      if (!isConfigured) {
        setTimeout(() => {
          localStorage.setItem('student_application_number', actualAppNumber.trim());
          setIsLoading(false);
          navigate('/dashboard');
        }, 500);
        return;
      }

      try {
        const hashedPassword = await hashPassword(actualPassword.trim());

        if (isLogin) {
          const { data, error } = await supabase
            .from('student_profiles')
            .select('*')
            .ilike('application_number', actualAppNumber.trim())
          .eq('password', hashedPassword)
          .maybeSingle();
          
          if (error) {
            console.error("Supabase login error:", error);
            throw new Error(`DB Error: ${error.message}`);
          }
          if (!data) {
            console.log("No data returned for:", actualAppNumber.trim(), "with hash:", hashedPassword);
            throw new Error(`Invalid Application Number or Password (Debug: No match found)`);
          }
          
        } else {
        // Register flow
          const { data: existingUser } = await supabase
            .from('student_profiles')
            .select('id')
            .eq('application_number', actualAppNumber.trim())
            .maybeSingle();

          if (existingUser) throw new Error("An account with this Application Number already exists");

          // Save to student_profiles natively
          const { error: profileError } = await supabase.from('student_profiles').insert({
            id: crypto.randomUUID(), // Generate a UUID since we aren't using Supabase Auth anymore
            application_number: actualAppNumber.trim(),
          name,
          email,
          mobile_number: mobile,
          course,
          department,
          password: hashedPassword
        });
        
        if (profileError) throw profileError;
        }
        
        localStorage.setItem('student_application_number', actualAppNumber.trim());
        navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] py-12 px-4 relative">
      <div className="absolute top-0 left-4 md:left-0">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-text-secondary hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-primary/20">
          {isLogin ? <LogIn className="w-8 h-8" /> : <UserPlus className="w-8 h-8" />}
        </div>
        <h1 className="text-4xl font-extrabold mb-4 text-white">
          {isLogin ? 'Student Login' : 'Student Registration'}
        </h1>
        <p className="text-lg text-text-secondary max-w-md mx-auto">
          {isLogin ? 'Enter your credentials to access your dashboard.' : 'Create an account to begin your registration process.'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-xl"
      >
        <Card className="p-8">
          <form onSubmit={handleAuth} className="space-y-4">
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
                {errorMsg}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={isLogin ? "md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4 col-span-1 md:col-span-2"}>
                <Select 
                  label="Admission Quota" 
                  name="quota"
                  value={quota} 
                  onChange={(e) => {
                    setQuota(e.target.value);
                    setAppNumber('');
                  }} 
                  required 
                  options={[{ value: 'Government', label: 'Government Quota' }, { value: 'Management', label: 'Management Quota' }]} 
                />
                
                <div className="relative">
                  <Input
                    label="Application Number"
                    name="appNumber"
                    type="text"
                    placeholder={quota === 'Management' ? "5-digit number" : "6-digit number"}
                    value={appNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // only allow digits
                      if (quota === 'Management') {
                        if (val.length <= 5) setAppNumber(val);
                      } else {
                        if (val.length <= 6) setAppNumber(val);
                      }
                    }}
                    required
                    className={quota === 'Management' ? "pl-[90px]" : ""}
                  />
                  {quota === 'Management' && (
                    <div className="absolute left-3 top-[34px] text-text-secondary pointer-events-none select-none font-mono">
                      TRP2026/
                    </div>
                  )}
                </div>
              </div>
              
              <AnimatePresence>
                {!isLogin && (
                  <>
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Input label="Full Name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:col-span-2 grid md:grid-cols-2 gap-4">
                      <Input label="Email Address" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      <Input label="Mobile Number" type="tel" placeholder="9876543210" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:col-span-2 grid md:grid-cols-2 gap-4">
                      <Select 
                        label="Degree" 
                        value={course} 
                        onChange={(e) => {
                          setCourse(e.target.value);
                          setDepartment(''); // Reset department when degree changes
                        }} 
                        required 
                        options={DEGREE_OPTIONS} 
                      />
                      <Select 
                        label="Course/Department" 
                        value={department} 
                        onChange={(e) => setDepartment(e.target.value)} 
                        required 
                        options={course && DEPARTMENT_MAP[course] ? DEPARTMENT_MAP[course] : []} 
                        disabled={!course}
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className={isLogin ? "md:col-span-2" : ""}>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {isLogin && (
                  <div className="flex justify-end mt-1">
                    <button 
                      type="button" 
                      onClick={() => setErrorMsg('Contact the admin to change the password')} 
                      className="text-xs text-primary hover:text-white transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </motion.div>
              )}
            </div>
            
            <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
              {isLogin ? (
                <><LogIn className="w-4 h-4 mr-2" /> Login</>
              ) : (
                <><UserPlus className="w-4 h-4 mr-2" /> Register</>
              )}
            </Button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-white/10 text-center space-y-3">
            <p className="text-sm text-text-secondary">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }} 
                className="text-primary hover:text-white transition-colors font-medium"
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
            <p className="text-sm text-text-secondary">
              Admin? <button onClick={() => navigate('/admin/login')} className="text-primary hover:text-white transition-colors">Login here</button>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
