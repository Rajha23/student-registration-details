import React, { useState } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { hashPassword } from '../../utils/auth';

interface CreateStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

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

export const CreateStudentModal = ({ onClose, onSuccess }: CreateStudentModalProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    quota: 'Government',
    application_number: '',
    password: '',
    name: '',
    email: '',
    mobile_number: '',
    course: '', // Represents Degree
    department: '' // Represents Course/Department
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDegree = e.target.value;
    setFormData(prev => ({ ...prev, course: newDegree, department: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let actualAppNumber = formData.application_number.trim();
    if (formData.quota === 'Management') {
      if (!/^\d{5}$/.test(actualAppNumber)) {
        alert('Management Quota application number must be exactly 5 digits');
        return;
      }
      actualAppNumber = `TRP2026/${actualAppNumber}`;
    } else {
      if (!/^\d{6}$/.test(actualAppNumber)) {
        alert('Government Quota application number must be exactly 6 digits');
        return;
      }
    }
    
    setIsSaving(true);
    
    try {
      const appNumber = actualAppNumber;
      
      const appNumberRegex = /^[a-zA-Z0-9/]{1,20}$/;
      if (!appNumberRegex.test(appNumber)) {
        throw new Error("Application Number format is invalid");
      }
      
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Check if application number already exists
      const { data: existing } = await supabase
        .from('student_profiles')
        .select('application_number')
        .eq('application_number', appNumber)
        .maybeSingle();
        
      if (existing) {
        throw new Error(`Application Number ${appNumber} already exists!`);
      }

      const hashedPassword = await hashPassword(formData.password.trim());

      // Save to student_profiles
      const { error } = await supabase.from('student_profiles').insert({
        id: crypto.randomUUID(),
        application_number: appNumber,
        name: formData.name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        course: formData.course,
        department: formData.department,
        password: hashedPassword
      });
      
      if (error) throw error;
      
      onSuccess();
    } catch (err: any) {
      alert("Failed to create student login: " + err.message);
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
          className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div>
              <h2 className="text-xl font-bold">Create Student Login</h2>
              <p className="text-sm text-text-secondary">Register a student manually</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                  label="Admission Quota" 
                  name="quota"
                  value={formData.quota} 
                  onChange={(e) => setFormData(prev => ({ ...prev, quota: e.target.value, application_number: '' }))} 
                  required 
                  options={[{ value: 'Government', label: 'Government Quota' }, { value: 'Management', label: 'Management Quota' }]} 
                />
                
                <div className="relative">
                  <Input 
                    label="Application Number" 
                    name="application_number"
                    value={formData.application_number} 
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, ''); // only allow digits
                      if (formData.quota === 'Management') {
                        if (val.length <= 5) setFormData(prev => ({ ...prev, application_number: val }));
                      } else {
                        if (val.length <= 6) setFormData(prev => ({ ...prev, application_number: val }));
                      }
                    }} 
                    required 
                    placeholder={formData.quota === 'Management' ? "5-digit number" : "6-digit number"}
                    className={formData.quota === 'Management' ? "pl-[90px]" : ""}
                  />
                  {formData.quota === 'Management' && (
                    <div className="absolute left-3 top-[34px] text-text-secondary pointer-events-none select-none font-mono">
                      TRP2026/
                    </div>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <Input 
                  label="Password" 
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password} 
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

              <Input 
                label="Student Name" 
                name="name"
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
              <Input 
                label="Email Address" 
                name="email"
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              <Input 
                label="Mobile Number" 
                name="mobile_number"
                type="tel" 
                maxLength={10}
                onInput={(e: any) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')}
                value={formData.mobile_number} 
                onChange={handleChange} 
                required 
              />
              <Select 
                label="Degree" 
                name="course"
                value={formData.course} 
                onChange={handleDegreeChange} 
                required 
                options={DEGREE_OPTIONS} 
              />
              <Select 
                label="Course/Department" 
                name="department"
                value={formData.department} 
                onChange={handleChange} 
                required 
                options={formData.course && DEPARTMENT_MAP[formData.course] ? DEPARTMENT_MAP[formData.course] : []}
                disabled={!formData.course}
              />
              
              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving} className="bg-primary hover:bg-primary-hover text-white">
                  <Save className="w-4 h-4 mr-2" />
                  Create Student
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
