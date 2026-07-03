import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { StepIndicator } from '../components/ui/StepIndicator';
import { firstYearDataSchema, type FirstYearDataFormData } from '../schemas/forms';
import { supabase } from '../supabase/client';

const STEPS = ['Personal Details', 'Family Details', 'Community & Income'];

export const FirstYearDataForm = () => {
  const navigate = useNavigate();
  const [folderNumber, setFolderNumber] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<FirstYearDataFormData>({
    resolver: zodResolver(firstYearDataSchema),
    mode: 'onTouched',
  });

  const firstGraduate = watch('first_graduate');

  // Load draft data on mount
  useEffect(() => {
    const fn = localStorage.getItem('student_folder_number');
    if (!fn) {
      navigate('/access');
      return;
    }
    setFolderNumber(fn);

    const loadDraft = async () => {
      const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) return;

      const { data } = await supabase
        .from('first_year_data')
        .select('*')
        .eq('folder_number', fn)
        .single();
        
      if (data) {
        Object.keys(data).forEach((key) => {
          if (key !== 'id' && key !== 'folder_number' && key !== 'created_at' && key !== 'updated_at' && key !== 'status') {
             // @ts-ignore
             setValue(key, data[key] || '');
          }
        });
      } else {
        // Pre-fill from Form 1 if available
        const { data: basicData } = await supabase
          .from('student_basic_details')
          .select('*')
          .eq('folder_number', fn)
          .single();
          
        if (basicData) {
          setValue('student_name', basicData.student_name);
          setValue('programme', basicData.programme);
          // ... other prefill fields omitted for brevity
        }
      }
    };
    loadDraft();
  }, [navigate, setValue]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['student_name', 'programme', 'course', 'admission_category', 'application_number', 'mobile_number', 'alternative_number', 'email_id', 'dob', 'gender', 'blood_group', 'mother_tongue', 'aadhaar_number'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['father_name', 'father_mobile', 'mother_name', 'mother_mobile', 'single_parent', 'parents_occupation'];
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSaveDraft = async (data: Partial<FirstYearDataFormData>) => {
    if (!folderNumber) return;
    setIsSaving(true);
    
    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!isConfigured) {
      setTimeout(() => {
        alert("Draft saved successfully! (Mock Mode)");
        setIsSaving(false);
      }, 500);
      return;
    }

    try {
      const { error } = await supabase
        .from('first_year_data')
        .upsert({
          status: 'draft',
          ...data,
          folder_number: folderNumber
        }, { onConflict: 'folder_number' });
        
      if (error) throw error;
      alert("Draft saved successfully!");
    } catch (err: any) {
      alert("Error saving draft: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: FirstYearDataFormData) => {
    if (!folderNumber) return;
    setIsSubmitting(true);

    const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!isConfigured) {
      setTimeout(() => {
        navigate('/form/success');
      }, 1000);
      return;
    }

    try {
      const { error } = await supabase
        .from('first_year_data')
        .upsert({
          status: 'submitted',
          ...data,
          folder_number: folderNumber
        }, { onConflict: 'folder_number' });
        
      if (error) throw error;
      navigate('/form/success');
    } catch (err: any) {
      alert("Error submitting form: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    // If user presses Enter in an input, prevent form submission and trigger Next Step instead
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
      e.preventDefault();
      if (currentStep < STEPS.length - 1) {
        handleNext();
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 relative">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-text-secondary hover:text-white -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">First Year Data 2026-27</h1>
        <p className="text-text-secondary">Please provide your family, community, and income details.</p>
      </div>

      <Card className="mb-8 p-4 md:p-8">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
        <Card className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Student Name" {...register('student_name')} error={errors.student_name?.message} required className="md:col-span-2" />
                  
                  <Select label="Programme" {...register('programme')} error={errors.programme?.message} required options={[{ value: 'BE & B.Tech', label: 'BE & B.Tech' }, { value: 'M.E', label: 'M.E' }, { value: 'MBA', label: 'MBA' }]} />
                  <Select label="Course" {...register('course')} error={errors.course?.message} required options={[
                      { value: 'B.E Civil Engineering', label: 'B.E Civil Engineering' },
                      { value: 'B.E Computer Science and Engineering', label: 'B.E Computer Science and Engineering' },
                      { value: 'B.Tech Information Technology', label: 'B.Tech Information Technology' },
                      { value: 'MBA', label: 'MBA' }
                  ]} />
                  
                  <Select label="Admission Category" {...register('admission_category')} error={errors.admission_category?.message} required options={[{ value: 'Management Quota', label: 'Management Quota' }, { value: 'Government Quota (Counseling)', label: 'Government Quota (Counseling)' }]} />
                  <Input label="Application/Allotment Number" {...register('application_number')} error={errors.application_number?.message} required />
                  
                  <Input label="Mobile Number" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('mobile_number')} error={errors.mobile_number?.message} required />
                  <Input label="Alternative Number" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('alternative_number')} error={errors.alternative_number?.message} />
                  
                  <Input label="Email ID" type="email" {...register('email_id')} error={errors.email_id?.message} required className="md:col-span-2" />
                  
                  <Input label="Date of Birth" type="date" {...register('dob')} error={errors.dob?.message} required />
                  <Select label="Gender" {...register('gender')} error={errors.gender?.message} required options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
                  
                  <Select label="Blood Group" {...register('blood_group')} error={errors.blood_group?.message} required options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => ({value: bg, label: bg}))} />
                  <Input label="Mother Tongue" {...register('mother_tongue')} error={errors.mother_tongue?.message} required />
                  
                  <Input label="Aadhaar Number" {...register('aadhaar_number')} error={errors.aadhaar_number?.message} required className="md:col-span-2" />
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Father Name" {...register('father_name')} error={errors.father_name?.message} required />
                  <Input label="Father's Mobile Number" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('father_mobile')} error={errors.father_mobile?.message} required />
                  
                  <Input label="Mother Name" {...register('mother_name')} error={errors.mother_name?.message} required />
                  <Input label="Mother's Mobile Number" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('mother_mobile')} error={errors.mother_mobile?.message} required />
                  
                  <Select label="Single Parent" {...register('single_parent')} error={errors.single_parent?.message} required options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
                  <Input label="Parents Occupation" {...register('parents_occupation')} error={errors.parents_occupation?.message} required />
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Religion" {...register('religion')} error={errors.religion?.message} required />
                  <Select label="Community" {...register('community')} error={errors.community?.message} required options={['OC', 'BC', 'BCM', 'MBC/DNC', 'SC', 'SCA', 'ST', 'Other'].map(c => ({value: c, label: c}))} />
                  
                  <Input label="Caste Name" {...register('caste_name')} error={errors.caste_name?.message} required />
                  <Input label="Community Certificate Number" placeholder="TN-XXXX" {...register('community_certificate_number')} error={errors.community_certificate_number?.message} required />
                  
                  <Input label="Annual Income" {...register('annual_income')} error={errors.annual_income?.message} required />
                  <Input label="Income Certificate Number (Optional)" {...register('income_certificate_number')} error={errors.income_certificate_number?.message} />
                  
                  <Select label="First Graduate" {...register('first_graduate')} error={errors.first_graduate?.message} required options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
                  {firstGraduate === 'Yes' && (
                    <Input label="First Graduate Certificate Number" {...register('first_graduate_certificate_number')} error={errors.first_graduate_certificate_number?.message} required />
                  )}
                  
                  <Input label="EMIS Number" {...register('emis_number')} error={errors.emis_number?.message} required className="md:col-span-2" />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/10">
            <div>
              {currentStep > 0 && (
                <Button type="button" variant="ghost" onClick={(e) => { e.preventDefault(); handleBack(); }}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
            </div>
            
            <div className="flex gap-4">
              <Button type="button" variant="secondary" onClick={(e) => { e.preventDefault(); handleSaveDraft(watch()); }} isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" /> Save Draft
              </Button>
              
              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={(e) => { e.preventDefault(); handleNext(); }}>
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" isLoading={isSubmitting} className="bg-green-600 hover:bg-green-700 shadow-[0_0_15px_rgba(22,163,74,0.3)]">
                  <CheckCircle className="w-4 h-4 mr-2" /> Submit Application
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};
