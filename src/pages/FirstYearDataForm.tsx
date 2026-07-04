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

const STEPS = ['Personal Details', 'Family Details', 'Community, Income & School'];

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
  const residenceType = watch('residence_type');
  const transportMode = watch('transport_mode');
  const siblingsCount = parseInt(watch('siblings_count') || '0', 10);
  const isSameAddress = watch('is_same_address');

  // Address sync values
  const permAddress1 = watch('perm_address_line_1');
  const permAddress2 = watch('perm_address_line_2');
  const permVillage = watch('perm_village_city');
  const permDistrict = watch('perm_district');
  const permState = watch('perm_state');
  const permPincode = watch('perm_pincode');

  const tenthDistrict = watch('tenth_district');
  const tenthBlock = watch('tenth_block');
  const twelfthDistrict = watch('twelfth_district');
  const twelfthBlock = watch('twelfth_block');

  const tenthDistrictOptions = Object.keys(schoolData).sort().map(d => ({ value: d, label: d }));
  const tenthBlockOptions = tenthDistrict && schoolData[tenthDistrict] 
    ? Object.keys(schoolData[tenthDistrict]).sort().map(b => ({ value: b, label: b })) : [];
  const tenthSchoolOptions = tenthDistrict && tenthBlock && schoolData[tenthDistrict]?.[tenthBlock]
    ? schoolData[tenthDistrict][tenthBlock].sort().map(s => ({ value: s, label: s })) : [];

  const twelfthDistrictOptions = Object.keys(schoolData).sort().map(d => ({ value: d, label: d }));
  const twelfthBlockOptions = twelfthDistrict && schoolData[twelfthDistrict] 
    ? Object.keys(schoolData[twelfthDistrict]).sort().map(b => ({ value: b, label: b })) : [];
  const twelfthSchoolOptions = twelfthDistrict && twelfthBlock && schoolData[twelfthDistrict]?.[twelfthBlock]
    ? schoolData[twelfthDistrict][twelfthBlock].sort().map(s => ({ value: s, label: s })) : [];

  // Clear dependent fields when parent changes, safely ignoring initial load
  const prevTenthDistrict = useRef<string | undefined>(tenthDistrict);
  const prevTenthBlock = useRef<string | undefined>(tenthBlock);
  const prevTwelfthDistrict = useRef<string | undefined>(twelfthDistrict);
  const prevTwelfthBlock = useRef<string | undefined>(twelfthBlock);
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
    if (prevTenthDistrict.current !== undefined && prevTenthDistrict.current !== tenthDistrict) {
      setValue('tenth_block', '', { shouldValidate: false });
      setValue('tenth_school', '', { shouldValidate: false });
    }
    prevTenthDistrict.current = tenthDistrict;
  }, [tenthDistrict, setValue]);

  useEffect(() => {
    if (prevTenthBlock.current !== undefined && prevTenthBlock.current !== tenthBlock) {
      setValue('tenth_school', '', { shouldValidate: false });
    }
    prevTenthBlock.current = tenthBlock;
  }, [tenthBlock, setValue]);

  useEffect(() => {
    if (prevTwelfthDistrict.current !== undefined && prevTwelfthDistrict.current !== twelfthDistrict) {
      setValue('twelfth_block', '', { shouldValidate: false });
      setValue('twelfth_school', '', { shouldValidate: false });
    }
    prevTwelfthDistrict.current = twelfthDistrict;
  }, [twelfthDistrict, setValue]);

  useEffect(() => {
    if (prevTwelfthBlock.current !== undefined && prevTwelfthBlock.current !== twelfthBlock) {
      setValue('twelfth_school', '', { shouldValidate: false });
    }
    prevTwelfthBlock.current = twelfthBlock;
  }, [twelfthBlock, setValue]);

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

  // Sync addresses if "Yes"
  useEffect(() => {
    if (isSameAddress === 'Yes') {
      setValue('comm_address_line_1', permAddress1 || '', { shouldValidate: true });
      setValue('comm_address_line_2', permAddress2 || '', { shouldValidate: true });
      setValue('comm_village_city', permVillage || '', { shouldValidate: true });
      setValue('comm_district', permDistrict || '', { shouldValidate: true });
      setValue('comm_state', permState || '', { shouldValidate: true });
      setValue('comm_pincode', permPincode || '', { shouldValidate: true });
    }
  }, [isSameAddress, permAddress1, permAddress2, permVillage, permDistrict, permState, permPincode, setValue]);

  // Default state to Tamil Nadu if empty
  useEffect(() => {
    if (!permState) setValue('perm_state', 'Tamil Nadu', { shouldValidate: false });
    if (!watch('comm_state') && isSameAddress === 'No') setValue('comm_state', 'Tamil Nadu', { shouldValidate: false });
  }, [permState, isSameAddress, setValue, watch]);

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
      fieldsToValidate = ['email', 'student_name', 'programme', 'course', 'admission_category', 'application_number', 'mobile_number', 'alternative_number', 'email_id', 'dob', 'gender', 'blood_group', 'mother_tongue', 'aadhaar_number', 'field_of_interest', 'residence_type', 
        'perm_address_line_1', 'perm_address_line_2', 'perm_village_city', 'perm_district', 'perm_state', 'perm_pincode',
        'is_same_address',
        ...(isSameAddress === 'No' ? ['comm_address_line_1', 'comm_address_line_2', 'comm_village_city', 'comm_district', 'comm_state', 'comm_pincode'] : []),
        ...(residenceType === 'Dayscholar' ? ['transport_mode'] : []), ...(transportMode === 'College Bus' ? ['boarding_point'] : []), ...(residenceType === 'Outside Stay' ? ['outside_stay_details'] : []), ...(gender === 'Other' ? ['gender_other'] : [])];
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
      fieldsToValidate = ['religion', 'community', 'caste_name', 'father_income', 'mother_income', 'guardian_income', 'first_graduate', 'emis_number', 'date_of_document_submission', 
      'tenth_district', 'tenth_block', 'tenth_school', 'tenth_total_marks', 'tenth_lang_mark', 'tenth_eng_mark', 'tenth_math_mark', 'tenth_sci_mark', 'tenth_soc_mark',
      'twelfth_district', 'twelfth_block', 'twelfth_school', 'twelfth_total_marks', 'twelfth_lang_mark', 'twelfth_eng_mark', 'twelfth_sub1_name', 'twelfth_sub1_mark', 'twelfth_sub2_name', 'twelfth_sub2_mark', 'twelfth_sub3_name', 'twelfth_sub3_mark', 'twelfth_sub4_name', 'twelfth_sub4_mark',
      ...(community === 'Other' ? ['community_other'] : []), ...(community !== 'OC' ? ['community_certificate_number'] : [])];
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
                  
                  {/* Addresses */}
                  <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
                    <h3 className="text-lg font-medium text-white mb-4">Permanent Address</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input label="Address Line 1 (House No)" {...register('perm_address_line_1')} error={errors.perm_address_line_1?.message} required />
                      <Input label="Address Line 2 (Street)" {...register('perm_address_line_2')} error={errors.perm_address_line_2?.message} required />
                      <Input label="Village / Town / City" {...register('perm_village_city')} error={errors.perm_village_city?.message} required />
                      <Input label="District" {...register('perm_district')} error={errors.perm_district?.message} required />
                      <Input label="State" {...register('perm_state')} error={errors.perm_state?.message} required />
                      <Input label="PIN Code" maxLength={6} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('perm_pincode')} error={errors.perm_pincode?.message} required />
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white mb-2 md:mb-0">Communication Address</h3>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-text-secondary">Same as Permanent Address?</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="Yes" {...register('is_same_address')} className="w-4 h-4 text-primary bg-background/50 border-white/10" />
                            <span className="text-sm">Yes</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" value="No" {...register('is_same_address')} className="w-4 h-4 text-primary bg-background/50 border-white/10" />
                            <span className="text-sm">No</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    {errors.is_same_address?.message && <p className="text-red-500 text-xs mt-1 mb-4">{errors.is_same_address.message}</p>}

                    {isSameAddress === 'No' && (
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input label="Address Line 1 (House No)" {...register('comm_address_line_1')} error={errors.comm_address_line_1?.message} required />
                        <Input label="Address Line 2 (Street)" {...register('comm_address_line_2')} error={errors.comm_address_line_2?.message} required />
                        <Input label="Village / Town / City" {...register('comm_village_city')} error={errors.comm_village_city?.message} required />
                        <Input label="District" {...register('comm_district')} error={errors.comm_district?.message} required />
                        <Input label="State" {...register('comm_state')} error={errors.comm_state?.message} required />
                        <Input label="PIN Code" maxLength={6} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('comm_pincode')} error={errors.comm_pincode?.message} required />
                      </div>
                    )}
                  </div>

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
                    <h3 className="text-lg font-medium text-white mb-4">10th Standard Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Select label="District" {...register('tenth_district')} error={errors.tenth_district?.message} required options={tenthDistrictOptions} />
                      <Select label="Block" {...register('tenth_block')} error={errors.tenth_block?.message} required options={tenthBlockOptions} disabled={!tenthDistrict} />
                      <div className="md:col-span-2">
                        <SearchableSelect label="School" {...register('tenth_school')} value={watch('tenth_school')} error={errors.tenth_school?.message} required options={tenthSchoolOptions} disabled={!tenthBlock} />
                      </div>
                      
                      <div className="md:col-span-2 mt-2">
                        <h4 className="text-sm font-medium text-text-secondary mb-3">10th Marks (Out of 100 per subject)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <Input label="Language" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('tenth_lang_mark')} error={errors.tenth_lang_mark?.message} required />
                          <Input label="English" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('tenth_eng_mark')} error={errors.tenth_eng_mark?.message} required />
                          <Input label="Maths" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('tenth_math_mark')} error={errors.tenth_math_mark?.message} required />
                          <Input label="Science" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('tenth_sci_mark')} error={errors.tenth_sci_mark?.message} required />
                          <Input label="Social" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('tenth_soc_mark')} error={errors.tenth_soc_mark?.message} required />
                          <Input label="Total Mark" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('tenth_total_marks')} error={errors.tenth_total_marks?.message} required className="bg-primary/5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t border-white/10 pt-6 mt-2">
                    <h3 className="text-lg font-medium text-white mb-4">12th Standard Details</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input label="EMIS Number" {...register('emis_number')} error={errors.emis_number?.message} required className="md:col-span-2" />
                      <Select label="District" {...register('twelfth_district')} error={errors.twelfth_district?.message} required options={twelfthDistrictOptions} />
                      <Select label="Block" {...register('twelfth_block')} error={errors.twelfth_block?.message} required options={twelfthBlockOptions} disabled={!twelfthDistrict} />
                      <div className="md:col-span-2">
                        <SearchableSelect label="School" {...register('twelfth_school')} value={watch('twelfth_school')} error={errors.twelfth_school?.message} required options={twelfthSchoolOptions} disabled={!twelfthBlock} />
                      </div>
                      
                      <div className="md:col-span-2 mt-2">
                        <h4 className="text-sm font-medium text-text-secondary mb-3">12th Marks (Out of 100 per subject)</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-4">
                          <Input label="Language Mark" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('twelfth_lang_mark')} error={errors.twelfth_lang_mark?.message} required />
                          <Input label="English Mark" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('twelfth_eng_mark')} error={errors.twelfth_eng_mark?.message} required />
                          <Input label="Total Mark (Out of 600)" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('twelfth_total_marks')} error={errors.twelfth_total_marks?.message} required className="bg-primary/5" />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 mb-4 p-4 bg-white/5 rounded-lg border border-white/5">
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="Subject 1 Name" placeholder="e.g. Physics" {...register('twelfth_sub1_name')} error={errors.twelfth_sub1_name?.message} required />
                            <Input label="Subject 1 Mark" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('twelfth_sub1_mark')} error={errors.twelfth_sub1_mark?.message} required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="Subject 2 Name" placeholder="e.g. Chemistry" {...register('twelfth_sub2_name')} error={errors.twelfth_sub2_name?.message} required />
                            <Input label="Subject 2 Mark" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('twelfth_sub2_mark')} error={errors.twelfth_sub2_mark?.message} required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="Subject 3 Name" placeholder="e.g. Maths" {...register('twelfth_sub3_name')} error={errors.twelfth_sub3_name?.message} required />
                            <Input label="Subject 3 Mark" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('twelfth_sub3_mark')} error={errors.twelfth_sub3_mark?.message} required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Input label="Subject 4 Name" placeholder="e.g. Computer Science" {...register('twelfth_sub4_name')} error={errors.twelfth_sub4_name?.message} required />
                            <Input label="Subject 4 Mark" maxLength={3} onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')} {...register('twelfth_sub4_mark')} error={errors.twelfth_sub4_mark?.message} required />
                          </div>
                        </div>
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
