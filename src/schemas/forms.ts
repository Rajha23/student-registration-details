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
  aadhaar_number: z.string().length(12, "Aadhaar must be 12 digits"),
  field_of_interest: z.string().optional(),
  
  // Address Details
  is_same_address: z.enum(['Yes', 'No']),
  
  perm_address_line_1: z.string().min(1, "Address Line 1 is required"),
  perm_address_line_2: z.string().min(1, "Address Line 2 is required"),
  perm_village_city: z.string().min(1, "Village/Town/City is required"),
  perm_district: z.string().min(1, "District is required"),
  perm_state: z.string().min(1, "State is required"),
  perm_pincode: z.string().length(6, "PIN Code must be 6 digits").regex(/^\d+$/, "Must contain only numbers"),
  
  comm_address_line_1: z.string().optional(),
  comm_address_line_2: z.string().optional(),
  comm_village_city: z.string().optional(),
  comm_district: z.string().optional(),
  comm_state: z.string().optional(),
  comm_pincode: z.string().optional(),

  // Residence & Transport
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
  income_certificate_number: z.string().optional(),
  
  // Scholarships
  first_graduate: z.string().min(1, "First Graduate is required"),
  first_graduate_certificate_number: z.string().refine(val => !val || val.startsWith("TN-"), "Must start with TN-").optional(),
  apply_pmss_scholarship: z.string().min(1, "Required"),
  apply_bc_mbc_scholarship: z.string().min(1, "Required"),
  
  emis_number: z.string().min(1, "EMIS Number is required"),
  
  district: z.string().optional(),
  block: z.string().optional(),
  school: z.string().optional(),
  date_of_document_submission: z.string().min(1, "Date of Document Submission is required"),

  // 10th Details
  tenth_board: z.string().min(1, "Board is required"),
  tenth_medium: z.string().min(1, "Medium is required"),
  tenth_district: z.string().min(1, "10th District is required"),
  tenth_block: z.string().min(1, "10th Block is required"),
  tenth_school: z.string().min(1, "10th School is required"),
  tenth_total_marks: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),
  tenth_lang_mark: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),
  tenth_eng_mark: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),
  tenth_math_mark: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),
  tenth_sci_mark: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),
  tenth_soc_mark: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),

  // 12th Details
  twelfth_board: z.string().min(1, "Board is required"),
  twelfth_medium: z.string().min(1, "Medium is required"),
  twelfth_district: z.string().min(1, "12th District is required"),
  twelfth_block: z.string().min(1, "12th Block is required"),
  twelfth_school: z.string().min(1, "12th School is required"),
  twelfth_total_marks: z.string().min(1, "Required").regex(/^\d+$/, "Must be a number"),
  twelfth_lang_mark: z.string().optional(),
  twelfth_eng_mark: z.string().optional(),
  twelfth_sub1_name: z.string().optional(),
  twelfth_sub1_mark: z.string().optional(),
  twelfth_sub2_name: z.string().optional(),
  twelfth_sub2_mark: z.string().optional(),
  twelfth_sub3_name: z.string().optional(),
  twelfth_sub3_mark: z.string().optional(),
  twelfth_sub4_name: z.string().optional(),
  twelfth_sub4_mark: z.string().optional(),
  icse_subjects: z.array(z.object({
    name: z.string().min(1, "Subject name is required"),
    mark: z.string().min(1, "Mark is required").regex(/^\d+$/, "Must be a number")
  })).optional(),
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

  // Communication Address validation if not same
  if (data.is_same_address === 'No') {
    if (!data.comm_address_line_1) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["comm_address_line_1"] });
    if (!data.comm_address_line_2) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["comm_address_line_2"] });
    if (!data.comm_village_city) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["comm_village_city"] });
    if (!data.comm_district) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["comm_district"] });
    if (!data.comm_state) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["comm_state"] });
    if (!data.comm_pincode || data.comm_pincode.length !== 6 || !/^\d+$/.test(data.comm_pincode)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Valid 6-digit PIN Code is required", path: ["comm_pincode"] });
    }
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
