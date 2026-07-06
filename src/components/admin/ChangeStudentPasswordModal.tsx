import React, { useState } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { Input } from '../ui/Input';
import { SearchableSelect } from '../ui/SearchableSelect';
import { Button } from '../ui/Button';
import { hashPassword } from '../../utils/auth';

interface ChangeStudentPasswordModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ChangeStudentPasswordModal = ({ onClose, onSuccess }: ChangeStudentPasswordModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appNumberOptions, setAppNumberOptions] = useState<{value: string, label: string}[]>([]);
  const [formData, setFormData] = useState({
    application_number: '',
    new_password: ''
  });

  React.useEffect(() => {
    const fetchAppNumbers = async () => {
      try {
        const { data, error } = await supabase
          .from('student_profiles')
          .select('application_number, name')
          .order('application_number');
          
        if (error) throw error;
        
        if (data) {
          setAppNumberOptions(data.map(profile => ({
            value: profile.application_number,
            label: `${profile.application_number} - ${profile.name || 'Unknown'}`
          })));
        }
      } catch (err) {
        console.error("Error fetching application numbers", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppNumbers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    
    try {
      const appNumber = formData.application_number.trim();
      
      const appNumberRegex = /^[a-zA-Z0-9]{6}$/;
      if (!appNumberRegex.test(appNumber)) {
        throw new Error("Application Number must be strictly 6 alphanumeric characters");
      }
      
      if (formData.new_password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check if application number exists and compare password
      const { data: existing } = await supabase
        .from('student_profiles')
        .select('application_number, password')
        .eq('application_number', appNumber)
        .maybeSingle();
        
      if (!existing) {
        throw new Error(`Application Number ${appNumber} not found!`);
      }
      
      const hashedPassword = await hashPassword(formData.new_password);
      
      if (existing.password === hashedPassword) {
        throw new Error("The new password is the same as the current password.");
      }

      // Update password
      const { error } = await supabase
        .from('student_profiles')
        .update({
          password: hashedPassword
        })
        .eq('application_number', appNumber);

      if (error) throw error;
      
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl shadow-2xl"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5 rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold">Change Student Password</h2>
              <p className="text-sm text-text-secondary">Update a student's login password</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <SearchableSelect 
                label="Application Number" 
                name="application_number"
                value={formData.application_number} 
                onChange={handleChange} 
                required 
                options={appNumberOptions}
                disabled={isLoading}
              />
              
              <div className="relative">
                <Input 
                  label="New Password" 
                  name="new_password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.new_password} 
                  onChange={handleChange} 
                  required 
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-text-secondary hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {errorMsg && (
                <p className="text-red-500 text-sm">{errorMsg}</p>
              )}
              
              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving} className="bg-red-600 hover:bg-red-700 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
