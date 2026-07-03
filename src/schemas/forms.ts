import { z } from 'zod';

export const basicDetailsSchema = z.object({
  email: z.string().email("Invalid email address"),
  folder_number: z.string().min(1, "Folder Number is required"),
  student_name: z.string().min(2, "Student Name is required"),
  mobile_number: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  email_id: z.string().email("Invalid email address"),
  community: z.string().min(1, "Community is required"),
  community_other: z.string().optional(),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.string().min(1, "Gender is required"),
  gender_other: z.string().optional(),
  aadhaar_number: z.string().regex(/^[0-9]{12}$/, "Must be a 12-digit number"),
  admission_category: z.string().min(1, "Admission Category is required"),
  programme: z.string().min(1, "Programme is required"),
  course: z.string().min(1, "Course is required"),
  application_number: z.string().min(1, "Application Number is required"),
  father_name: z.string().min(2, "Father/Guardian Name is required"),
  father_mobile: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  date_of_document_submission: z.string().min(1, "Date of Submission is required"),
});

export type BasicDetailsFormData = z.infer<typeof basicDetailsSchema>;

export const firstYearDataSchema = z.object({
  student_name: z.string().min(2, "Student Name is required"),
  programme: z.string().min(1, "Programme is required"),
  course: z.string().min(1, "Course is required"),
  admission_category: z.string().min(1, "Admission Category is required"),
  application_number: z.string().min(1, "Application Number is required"),
  mobile_number: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  alternative_number: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number").optional().or(z.literal('')),
  email_id: z.string().email("Invalid email address"),
  dob: z.string().min(1, "Date of Birth is required"),
  gender: z.string().min(1, "Gender is required"),
  blood_group: z.string().min(1, "Blood Group is required"),
  mother_tongue: z.string().min(1, "Mother Tongue is required"),
  aadhaar_number: z.string().regex(/^[0-9]{12}$/, "Must be a 12-digit number"),
  
  father_name: z.string().min(2, "Father Name is required"),
  father_mobile: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  mother_name: z.string().min(2, "Mother Name is required"),
  mother_mobile: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  single_parent: z.string().min(1, "Please select Yes or No"),
  parents_occupation: z.string().min(2, "Occupation is required"),
  
  religion: z.string().min(1, "Religion is required"),
  community: z.string().min(1, "Community is required"),
  caste_name: z.string().min(1, "Caste Name is required"),
  community_certificate_number: z.string().startsWith("TN-", "Must start with TN-"),
  annual_income: z.string().min(1, "Annual Income is required"),
  income_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  first_graduate: z.string().min(1, "Please select Yes or No"),
  first_graduate_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  emis_number: z.string().min(1, "EMIS Number is required"),
});

export type FirstYearDataFormData = z.infer<typeof firstYearDataSchema>;
