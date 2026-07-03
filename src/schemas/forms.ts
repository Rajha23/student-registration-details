import { z } from 'zod';

export const firstYearDataSchema = z.object({
  email: z.string().email("Invalid email address"),
  student_name: z.string().min(2, "Student Name is required"),
  programme: z.string().min(1, "Programme is required"),
  course: z.string().min(1, "Course is required"),
  admission_category: z.string().min(1, "Admission Category is required"),
  application_number: z.string().min(1, "Application Number is required"),
  mobile_number: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  alternative_number: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number").optional().or(z.literal('')),
  email_id: z.string().email("Invalid email address").optional().or(z.literal('')),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.string().min(1, "Gender is required"),
  gender_other: z.string().optional(),
  blood_group: z.string().min(1, "Blood Group is required"),
  mother_tongue: z.string().min(1, "Mother Tongue is required"),
  aadhaar_number: z.string().regex(/^[0-9]{12}$/, "Must be a 12-digit number"),
  
  father_name: z.string().min(2, "Father Name is required"),
  father_mobile: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  mother_name: z.string().min(2, "Mother Name is required"),
  mother_mobile: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  single_parent: z.string().min(1, "Please select Yes or No"),
  father_occupation: z.string().min(2, "Father's Occupation is required"),
  mother_occupation: z.string().min(2, "Mother's Occupation is required"),
  
  religion: z.string().min(1, "Religion is required"),
  community: z.string().min(1, "Community is required"),
  community_other: z.string().optional(),
  caste_name: z.string().min(1, "Caste Name is required"),
  community_certificate_number: z.string().startsWith("TN-", "Must start with TN-"),
  annual_income: z.string().min(1, "Annual Income is required"),
  income_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  first_graduate: z.string().min(1, "Please select Yes or No"),
  first_graduate_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  emis_number: z.string().min(1, "EMIS Number is required"),
  
  date_of_document_submission: z.string().min(1, "Date of Submission is required"),
});

export type FirstYearDataFormData = z.infer<typeof firstYearDataSchema>;

export const documentUploadSchema = z.object({
  tenth_marksheet: z.string().min(1, "10th Mark sheet is required"),
  twelfth_marksheet: z.string().min(1, "12th Mark sheet is required"),
  tc: z.string().min(1, "Transfer Certificate (TC) is required"),
  community_certificate: z.string().min(1, "Community Certificate is required"),
  aadhar: z.string().min(1, "Aadhar is required"),
  photo: z.string().min(1, "Passport size photo is required"),
  father_photo: z.string().min(1, "Father's photo is required"),
  mother_photo: z.string().min(1, "Mother's photo is required"),
  sign: z.string().min(1, "Signature is required"),
  
  // Optional fields
  eleventh_marksheet: z.string().optional(),
  migration_certificate: z.string().optional(),
  first_graduate_certificate: z.string().optional(),
  nativity_certificate: z.string().optional(),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
