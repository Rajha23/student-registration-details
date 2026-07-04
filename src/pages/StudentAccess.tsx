import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ArrowLeft } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { supabase } from '../supabase/client';

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!appNumber.trim() || !password) return;
    
    if (!isLogin && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!isConfigured) {
      setTimeout(() => {
        localStorage.setItem('student_application_number', appNumber.trim());
        setIsLoading(false);
        navigate('/dashboard');
      }, 500);
      return;
    }

    try {
      const dummyEmail = `${appNumber.trim()}@student.registration.local`;
      
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: dummyEmail,
          password: password
        });
        
        if (error) throw error;
        
      } else {
        // Register flow
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: dummyEmail,
          password: password,
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
          // Save to student_profiles
          const { error: profileError } = await supabase.from('student_profiles').insert({
            id: authData.user.id,
            application_number: appNumber.trim(),
            name,
            email,
            mobile_number: mobile,
            course,
            department
          });
          
          if (profileError) throw profileError;
        }
      }

      localStorage.setItem('student_application_number', appNumber.trim());
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
              <div className={isLogin ? "md:col-span-2" : ""}>
                <Input
                  label="Application Number"
                  type="text"
                  placeholder="e.g. 123456"
                  value={appNumber}
                  onChange={(e) => setAppNumber(e.target.value)}
                  required
                />
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
                      <Input label="Course" type="text" placeholder="e.g. B.E" value={course} onChange={(e) => setCourse(e.target.value)} required />
                      <Input label="Department" type="text" placeholder="e.g. Computer Science" value={department} onChange={(e) => setDepartment(e.target.value)} required />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className={isLogin ? "md:col-span-2" : ""}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {!isLogin && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <Input
                    label="Confirm Password"
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
