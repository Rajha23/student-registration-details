import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../supabase/client';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

interface EditRegistrationModalProps {
  applicationNumber: string;
  onClose: () => void;
  onSave: () => void;
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

export const EditRegistrationModal = ({ applicationNumber, onClose, onSave }: EditRegistrationModalProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    application_number: '',
    name: '',
    email: '',
    mobile_number: '',
    course: '',
    department: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('application_number', applicationNumber)
          .single();

        if (data) {
          setFormData({
            application_number: data.application_number || '',
            name: data.name || '',
            email: data.email || '',
            mobile_number: data.mobile_number || '',
            course: data.course || '',
            department: data.department || ''
          });
        }
      } catch (err) {
        console.error("Error fetching profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [applicationNumber]);

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
    setIsSaving(true);
    
    try {
      const newAppNumber = formData.application_number.trim();
      
      const appNumberRegex = /^[a-zA-Z0-9]{6}$/;
      if (!appNumberRegex.test(newAppNumber)) {
        throw new Error("Application Number must be strictly 6 alphanumeric characters");
      }
      
      if (newAppNumber !== applicationNumber) {
        // First check if the new application number already exists
        const { data: existing } = await supabase
          .from('student_profiles')
          .select('application_number')
          .eq('application_number', newAppNumber)
          .maybeSingle();
          
        if (existing) {
          throw new Error(`Application Number ${newAppNumber} already exists!`);
        }
      }

      // Update student_profiles (even if app number changed, Supabase allows PK updates if no restrictive FK constraints)
      const { error } = await supabase
        .from('student_profiles')
        .update({
          application_number: newAppNumber,
          name: formData.name,
          email: formData.email,
          mobile_number: formData.mobile_number,
          course: formData.course,
          department: formData.department,
          updated_at: new Date().toISOString()
        })
        .eq('application_number', applicationNumber);

      if (error) throw error;
      
      // Sync basic details with first_year_data if it exists
      await supabase
        .from('first_year_data')
        .update({
          application_number: newAppNumber,
          student_name: formData.name,
          email: formData.email,
          mobile_number: formData.mobile_number,
          programme: formData.course,
          course: formData.department
        })
        .eq('application_number', applicationNumber);
        
      // Update student_documents if application number changed
      if (newAppNumber !== applicationNumber) {
        await supabase
          .from('student_documents')
          .update({
            application_number: newAppNumber
          })
          .eq('application_number', applicationNumber);
      }
        
      onSave();
    } catch (err: any) {
      alert("Failed to update registration details: " + err.message);
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
          className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div>
              <h2 className="text-xl font-bold">Edit Registration</h2>
              <p className="text-sm text-text-secondary">App Number: <span className="font-mono text-white">{applicationNumber}</span></p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                <p>Loading details...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                  label="Application Number" 
                  name="application_number"
                  value={formData.application_number} 
                  onChange={handleChange} 
                  required 
                />
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
                  <Button type="submit" isLoading={isSaving} className="bg-yellow-600 hover:bg-yellow-700 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
