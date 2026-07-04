import { z } from 'zod';

export const siblingSchema = z.object({
  name: z.string().min(2, "Name is required"),
  education: z.string().min(1, "Education is required"),
  occupation: z.string().min(1, "Occupation is required"),
});

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
  field_of_interest: z.string().optional(),
  
  residence_type: z.string().min(1, "Residence Type is required"),
  transport_mode: z.string().optional(),
  boarding_point: z.string().optional(),
  outside_stay_details: z.string().optional(),
  
  father_name: z.string().min(2, "Father Name is required"),
  father_mobile: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  mother_name: z.string().min(2, "Mother Name is required"),
  mother_mobile: z.string().regex(/^[0-9]{10}$/, "Must be a 10-digit number"),
  single_parent: z.string().min(1, "Please select Yes or No"),
  father_occupation: z.string().min(2, "Father's Occupation is required"),
  mother_occupation: z.string().min(2, "Mother's Occupation is required"),
  
  siblings_count: z.string().min(1, "Please select sibling count"),
  siblings: z.array(siblingSchema).optional(),
  
  religion: z.string().min(1, "Religion is required"),
  community: z.string().min(1, "Community is required"),
  community_other: z.string().optional(),
  caste_name: z.string().min(1, "Caste Name is required"),
  community_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  father_income: z.string().min(1, "Father Income is required"),
  mother_income: z.string().min(1, "Mother Income is required"),
  guardian_income: z.string().optional(),
  income_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  first_graduate: z.string().min(1, "Please select Yes or No"),
  first_graduate_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  emis_number: z.string().min(1, "EMIS Number is required"),
  
  district: z.string().min(1, "District is required"),
  block: z.string().min(1, "Block is required"),
  school: z.string().min(1, "School is required"),
  
  date_of_document_submission: z.string().min(1, "Date of Submission is required"),
}).superRefine((data, ctx) => {
  if (data.residence_type === 'Dayscholar') {
    if (!data.transport_mode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Transport Mode is required for Dayscholars",
        path: ["transport_mode"],
      });
    } else if (data.transport_mode === 'College Bus' && !data.boarding_point) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Boarding Point is required for College Bus",
        path: ["boarding_point"],
      });
    }
  } else if (data.residence_type === 'Outside Stay' && !data.outside_stay_details) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter the name of the PG or room you are staying in",
      path: ["outside_stay_details"],
    });
  }
  
  if (data.community !== 'OC' && !data.community_certificate_number) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Community Certificate Number is required",
      path: ["community_certificate_number"],
    });
  }
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
  income_certificate: z.string().optional(),
});

export type DocumentUploadFormData = z.infer<typeof documentUploadSchema>;
