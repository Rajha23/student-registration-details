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
import { basicDetailsSchema, type BasicDetailsFormData } from '../schemas/forms';
import { supabase } from '../supabase/client';

const STEPS = ['Contact & Course', 'Personal Details', 'Family & Admission'];

export const StudentBasicDetailsForm = () => {
  const navigate = useNavigate();
  const [folderNumber, setFolderNumber] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, trigger, watch, setValue, formState: { errors } } = useForm<BasicDetailsFormData>({
    resolver: zodResolver(basicDetailsSchema),
    mode: 'onTouched',
  });

  const community = watch('community');
  const gender = watch('gender');

  // Load draft data on mount
  useEffect(() => {
    const fn = localStorage.getItem('student_folder_number');
    if (!fn) {
      navigate('/access');
      return;
    }
    setFolderNumber(fn);
    setValue('folder_number', fn); // Auto-fill folder number

    const loadDraft = async () => {
      const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
      if (!isConfigured) return;

      const { data } = await supabase
        .from('student_basic_details')
        .select('*')
        .eq('folder_number', fn)
        .single();
        
      if (data) {
        Object.keys(data).forEach((key) => {
          if (key !== 'id' && key !== 'folder_number' && key !== 'created_at' && key !== 'updated_at' && key !== 'status') {
             // @ts-ignore
             setValue(key, data[key]);
          }
        });
      }
    };
    loadDraft();
  }, [navigate, setValue]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['email', 'folder_number', 'mobile_number', 'email_id', 'programme', 'course'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['student_name', 'dob', 'gender', 'aadhaar_number', ...(gender === 'Other' ? ['gender_other'] : [])];
    }
    
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSaveDraft = async (data: Partial<BasicDetailsFormData>) => {
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
        .from('student_basic_details')
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

  const onSubmit = async (data: BasicDetailsFormData) => {
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
        .from('student_basic_details')
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
        <h1 className="text-3xl font-bold mb-2">Student Basic Details</h1>
        <p className="text-text-secondary">Please fill in all the required information accurately.</p>
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
                  <Input label="Primary Email Address" type="email" {...register('email')} error={errors.email?.message} required />
                  <Input label="Folder Number" placeholder="DDMM/Branch/Quota/001" {...register('folder_number')} error={errors.folder_number?.message} required />
                  <Input label="Mobile Number" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('mobile_number')} error={errors.mobile_number?.message} required />
                  <Input label="Alternate Email ID" type="email" {...register('email_id')} error={errors.email_id?.message} required />
                  
                  <Select 
                    label="Programme" 
                    {...register('programme')} 
                    error={errors.programme?.message} 
                    required
                    options={[
                      { value: 'BE & B.Tech', label: 'BE & B.Tech' },
                      { value: 'M.E', label: 'M.E' },
                      { value: 'MBA', label: 'MBA' }
                    ]} 
                  />
                  
                  <Select 
                    label="Course" 
                    {...register('course')} 
                    error={errors.course?.message} 
                    required
                    options={[
                      { value: 'B.E Civil Engineering', label: 'B.E Civil Engineering' },
                      { value: 'B.E Electronics and Communication Engineering', label: 'B.E Electronics and Communication Engineering' },
                      { value: 'B.E Electrical and Electronics Engineering', label: 'B.E Electrical and Electronics Engineering' },
                      { value: 'B.E Computer Science and Engineering', label: 'B.E Computer Science and Engineering' },
                      { value: 'B.E Mechanical Engineering', label: 'B.E Mechanical Engineering' },
                      { value: 'B.E CSE (Artificial Intelligence and Machine Learning)', label: 'B.E CSE (AI & ML)' },
                      { value: 'B.Tech Information Technology', label: 'B.Tech Information Technology' },
                      { value: 'B.Tech Artificial Intelligence and Data Science', label: 'B.Tech AI and Data Science' },
                      { value: 'MBA', label: 'MBA' },
                      { value: 'M.E Thermal Engineering', label: 'M.E Thermal Engineering' },
                      { value: 'M.E VLSI Design', label: 'M.E VLSI Design' },
                    ]} 
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input 
                    label="Student Name (Initials at the end)" 
                    placeholder="e.g. RAVI S" 
                    {...register('student_name')} 
                    error={errors.student_name?.message} 
                    required 
                    className="md:col-span-2"
                  />
                  
                  <Input label="Date of Birth" type="date" {...register('dob')} error={errors.dob?.message} required />
                  
                  <Select 
                    label="Gender" 
                    {...register('gender')} 
                    error={errors.gender?.message} 
                    required
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' }
                    ]} 
                  />

                  {gender === 'Other' && (
                    <Input label="Specify Gender" {...register('gender_other')} error={errors.gender_other?.message} required className="md:col-span-2" />
                  )}

                  <Input label="Aadhaar Number" type="text" placeholder="12 digit number" {...register('aadhaar_number')} error={errors.aadhaar_number?.message} required className="md:col-span-2" />
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Father/Guardian Name" {...register('father_name')} error={errors.father_name?.message} required />
                  <Input label="Father/Guardian Mobile" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('father_mobile')} error={errors.father_mobile?.message} required />
                  
                  <Select 
                    label="Community" 
                    {...register('community')} 
                    error={errors.community?.message} 
                    required
                    options={[
                      { value: 'OC', label: 'OC' },
                      { value: 'BC', label: 'BC' },
                      { value: 'BCM', label: 'BCM' },
                      { value: 'MBC/DNC', label: 'MBC/DNC' },
                      { value: 'SC', label: 'SC' },
                      { value: 'SCA', label: 'SCA' },
                      { value: 'ST', label: 'ST' },
                      { value: 'Other', label: 'Other' }
                    ]} 
                  />

                  {community === 'Other' && (
                    <Input label="Specify Community" {...register('community_other')} error={errors.community_other?.message} required />
                  )}

                  <Select 
                    label="Admission Category" 
                    {...register('admission_category')} 
                    error={errors.admission_category?.message} 
                    required
                    options={[
                      { value: 'Management Quota', label: 'Management Quota' },
                      { value: 'Government Quota (Counseling)', label: 'Government Quota (Counseling)' }
                    ]} 
                  />

                  <Input label="Application/Allotment Number" {...register('application_number')} error={errors.application_number?.message} required />
                  <Input label="Date of Document Submission" type="date" {...register('date_of_document_submission')} error={errors.date_of_document_submission?.message} required />
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
