import { useState, useEffect, useRef } from 'react';
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
import { SearchableSelect } from '../components/ui/SearchableSelect';
import { firstYearDataSchema, type FirstYearDataFormData } from '../schemas/forms';
import { supabase } from '../supabase/client';
import { schoolData } from '../data/schools';

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
  const gender = watch('gender');
  const community = watch('community');
  const district = watch('district');
  const block = watch('block');
  const residenceType = watch('residence_type');
  const transportMode = watch('transport_mode');
  const siblingsCount = parseInt(watch('siblings_count') || '0', 10);

  // Prepare options for dependent dropdowns
  const districtOptions = Object.keys(schoolData).sort().map(d => ({ value: d, label: d }));
  
  const blockOptions = district && schoolData[district] 
    ? Object.keys(schoolData[district]).sort().map(b => ({ value: b, label: b }))
    : [];
    
  const schoolOptions = district && block && schoolData[district]?.[block]
    ? schoolData[district][block].sort().map(s => ({ value: s, label: s }))
    : [];

  // Clear dependent fields when parent changes, safely ignoring initial load
  const prevDistrict = useRef<string | undefined>(district);
  const prevBlock = useRef<string | undefined>(block);
  const prevResidence = useRef<string | undefined>(residenceType);
  const prevTransport = useRef<string | undefined>(transportMode);
  const prevCommunity = useRef<string | undefined>(community);
  
  useEffect(() => {
    if (prevCommunity.current !== undefined && prevCommunity.current !== community) {
      if (community === 'OC') {
        setValue('community_certificate_number', '', { shouldValidate: false });
      }
    }
    prevCommunity.current = community;
  }, [community, setValue]);

  useEffect(() => {
    // Only clear if the previous value was set (not initial mount/draft load) and it actually changed
    if (prevDistrict.current !== undefined && prevDistrict.current !== district) {
      setValue('block', '', { shouldValidate: false });
      setValue('school', '', { shouldValidate: false });
    }
    prevDistrict.current = district;
  }, [district, setValue]);

  useEffect(() => {
    if (prevBlock.current !== undefined && prevBlock.current !== block) {
      setValue('school', '', { shouldValidate: false });
    }
    prevBlock.current = block;
  }, [block, setValue]);

  useEffect(() => {
    if (prevResidence.current !== undefined && prevResidence.current !== residenceType) {
      if (residenceType !== 'Dayscholar') {
        setValue('transport_mode', '', { shouldValidate: false });
        setValue('boarding_point', '', { shouldValidate: false });
      }
      if (residenceType !== 'Outside Stay') {
        setValue('outside_stay_details', '', { shouldValidate: false });
      }
    }
    prevResidence.current = residenceType;
  }, [residenceType, setValue]);

  useEffect(() => {
    if (prevTransport.current !== undefined && prevTransport.current !== transportMode) {
      if (transportMode !== 'College Bus') {
        setValue('boarding_point', '', { shouldValidate: false });
      }
    }
    prevTransport.current = transportMode;
  }, [transportMode, setValue]);

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change') {
        if (name === 'siblings_count') {
          const count = parseInt(value.siblings_count || '0', 10);
          const currentSiblings = Array.isArray(value.siblings) ? [...value.siblings] : [];
          if (count < currentSiblings.length) {
            setValue('siblings', currentSiblings.slice(0, count) as any, { shouldValidate: true });
          } else if (count > currentSiblings.length) {
            const diff = count - currentSiblings.length;
            const newSiblings = [...currentSiblings, ...Array(diff).fill({ name: '', education: '', occupation: '' })];
            setValue('siblings', newSiblings as any, { shouldValidate: false });
          }
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setValue]);

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
      }
    };
    loadDraft();
  }, [navigate, setValue]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['email', 'student_name', 'programme', 'course', 'admission_category', 'application_number', 'mobile_number', 'alternative_number', 'email_id', 'dob', 'gender', 'blood_group', 'mother_tongue', 'aadhaar_number', 'field_of_interest', 'residence_type', ...(residenceType === 'Dayscholar' ? ['transport_mode'] : []), ...(transportMode === 'College Bus' ? ['boarding_point'] : []), ...(residenceType === 'Outside Stay' ? ['outside_stay_details'] : []), ...(gender === 'Other' ? ['gender_other'] : [])];
    } else if (currentStep === 1) {
      fieldsToValidate = ['father_name', 'father_mobile', 'father_occupation', 'mother_name', 'mother_mobile', 'mother_occupation', 'single_parent', 'siblings_count'];
      
      if (siblingsCount > 0) {
        for (let i = 0; i < siblingsCount; i++) {
          fieldsToValidate.push(`siblings.${i}.name`);
          fieldsToValidate.push(`siblings.${i}.education`);
          fieldsToValidate.push(`siblings.${i}.occupation`);
        }
      }
    } else if (currentStep === 2) {
      fieldsToValidate = ['religion', 'community', 'caste_name', 'father_income', 'mother_income', 'guardian_income', 'first_graduate', 'emis_number', 'district', 'block', 'school', 'date_of_document_submission', ...(community === 'Other' ? ['community_other'] : []), ...(community !== 'OC' ? ['community_certificate_number'] : [])];
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
                  <Input label="Folder Number" value={folderNumber || ''} readOnly className="md:col-span-2 bg-white/5 cursor-not-allowed text-text-secondary" />
                  
                  <Input label="Primary Email Address" type="email" {...register('email')} error={errors.email?.message} required className="md:col-span-2" />
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
                  
                  <Input label="Alternate Email" type="email" {...register('email_id')} error={errors.email_id?.message} className="md:col-span-2" />
                  
                  <Input label="Date of Birth" type="date" {...register('dob')} error={errors.dob?.message} required />
                  <Select label="Gender" {...register('gender')} error={errors.gender?.message} required options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} />
                  
                  {gender === 'Other' && (
                    <Input label="Specify Gender" {...register('gender_other')} error={errors.gender_other?.message} required className="md:col-span-2" />
                  )}

                  <Select label="Blood Group" {...register('blood_group')} error={errors.blood_group?.message} required options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => ({value: bg, label: bg}))} />
                  <Input label="Mother Tongue" {...register('mother_tongue')} error={errors.mother_tongue?.message} required />
                  
                  <Input label="Aadhaar Number" {...register('aadhaar_number')} error={errors.aadhaar_number?.message} required />
                  <Input label="Field of Interest (Optional)" {...register('field_of_interest')} error={errors.field_of_interest?.message} />
                  
                  <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
                    <h3 className="text-lg font-medium text-white mb-4">Residence & Transport Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Select 
                        label="Residence Type" 
                        {...register('residence_type')} 
                        error={errors.residence_type?.message} 
                        required 
                        options={[{ value: 'Dayscholar', label: 'Dayscholar' }, { value: 'Hosteller', label: 'Hosteller' }, { value: 'Outside Stay', label: 'Outside Stay' }]} 
                      />
                      
                      {residenceType === 'Dayscholar' && (
                        <Select 
                          label="Transport Mode" 
                          {...register('transport_mode')} 
                          error={errors.transport_mode?.message} 
                          required 
                          options={[{ value: 'College Bus', label: 'College Bus' }, { value: 'Own Mode of Transport', label: 'Own Mode of Transport' }]} 
                        />
                      )}
                      
                      {residenceType === 'Dayscholar' && transportMode === 'College Bus' && (
                        <div className="md:col-span-2">
                          <Input 
                            label="Boarding Point" 
                            {...register('boarding_point')} 
                            error={errors.boarding_point?.message} 
                            required 
                          />
                        </div>
                      )}

                      {residenceType === 'Outside Stay' && (
                        <div className="md:col-span-2">
                          <Input 
                            label="Name of PG / Room Details" 
                            {...register('outside_stay_details')} 
                            error={errors.outside_stay_details?.message} 
                            required 
                            placeholder="Enter PG name, area, or room address"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Father Name" {...register('father_name')} error={errors.father_name?.message} required />
                  <Input label="Father's Mobile Number" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('father_mobile')} error={errors.father_mobile?.message} required />
                  
                  <Input label="Mother Name" {...register('mother_name')} error={errors.mother_name?.message} required />
                  <Input label="Mother's Mobile Number" type="tel" maxLength={10} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('mother_mobile')} error={errors.mother_mobile?.message} required />
                  
                  <Input label="Father's Occupation" {...register('father_occupation')} error={errors.father_occupation?.message} required />
                  <Input label="Mother's Occupation" {...register('mother_occupation')} error={errors.mother_occupation?.message} required />
                  
                  <Select label="Single Parent" {...register('single_parent')} error={errors.single_parent?.message} required options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} className="md:col-span-2" />
                  
                  <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
                    <h3 className="text-lg font-medium text-white mb-4">Siblings Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Select 
                        label="Number of Siblings" 
                        {...register('siblings_count')} 
                        error={errors.siblings_count?.message} 
                        required 
                        options={[
                          { value: '0', label: '0' },
                          { value: '1', label: '1' },
                          { value: '2', label: '2' },
                          { value: '3', label: '3' },
                          { value: '4', label: '4' },
                          { value: '5', label: '5' }
                        ]}
                      />
                    </div>
                    
                    {siblingsCount > 0 && (
                      <div className="mt-6 space-y-4">
                        {Array.from({ length: siblingsCount }).map((_, idx) => (
                          <div key={idx} className="grid md:grid-cols-3 gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                            <h4 className="md:col-span-3 text-sm font-medium text-primary mb-1">Sibling {idx + 1}</h4>
                            <Input label="Name" {...register(`siblings.${idx}.name` as const)} error={errors.siblings?.[idx]?.name?.message} required />
                            <Input label="Education" {...register(`siblings.${idx}.education` as const)} error={errors.siblings?.[idx]?.education?.message} required />
                            <Input label="Occupation" {...register(`siblings.${idx}.occupation` as const)} error={errors.siblings?.[idx]?.occupation?.message} required />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Religion" {...register('religion')} error={errors.religion?.message} required />
                  <Select label="Community" {...register('community')} error={errors.community?.message} required options={['OC', 'BC', 'BCM', 'MBC/DNC', 'SC', 'SCA', 'ST', 'Other'].map(c => ({value: c, label: c}))} />
                  
                  {community === 'Other' && (
                    <Input label="Specify Community" {...register('community_other')} error={errors.community_other?.message} required className="md:col-span-2" />
                  )}

                  <Input label="Caste Name" {...register('caste_name')} error={errors.caste_name?.message} required />
                  
                  {community !== 'OC' && (
                    <Input label="Community Certificate Number" placeholder="TN-XXXX" {...register('community_certificate_number')} error={errors.community_certificate_number?.message} required />
                  )}
                  
                  <div className="md:col-span-2 grid md:grid-cols-3 gap-6">
                    <Input label="Father's Income" {...register('father_income')} error={errors.father_income?.message} required />
                    <Input label="Mother's Income" {...register('mother_income')} error={errors.mother_income?.message} required />
                    <Input label="Guardian's Income (Optional)" {...register('guardian_income')} error={errors.guardian_income?.message} />
                  </div>
                  
                  <Input label="Income Certificate Number (Optional)" {...register('income_certificate_number')} error={errors.income_certificate_number?.message} className="md:col-span-2" />
                  
                  <Select label="First Graduate" {...register('first_graduate')} error={errors.first_graduate?.message} required options={[{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }]} />
                  {firstGraduate === 'Yes' && (
                    <Input label="First Graduate Certificate Number" {...register('first_graduate_certificate_number')} error={errors.first_graduate_certificate_number?.message} required />
                  )}
                  
                  <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
                    <h3 className="text-lg font-medium text-white mb-4">School Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input label="EMIS Number" {...register('emis_number')} error={errors.emis_number?.message} required className="md:col-span-2" />
                      
                      <Select 
                        label="District" 
                        {...register('district')} 
                        error={errors.district?.message} 
                        required 
                        options={districtOptions} 
                      />
                      
                      <Select 
                        label="Block" 
                        {...register('block')} 
                        error={errors.block?.message} 
                        required 
                        options={blockOptions} 
                        disabled={!district}
                      />
                      
                      <div className="md:col-span-2">
                        <SearchableSelect 
                          label="School" 
                          {...register('school')}
                          value={watch('school')}
                          error={errors.school?.message} 
                          required 
                          options={schoolOptions}
                          disabled={!block}
                        />
                      </div>
                    </div>
                  </div>

                  <Input label="Date of Document Submission" type="date" {...register('date_of_document_submission')} error={errors.date_of_document_submission?.message} required className="md:col-span-2 mt-4" />
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
