-- CreateTable
CREATE TABLE "engineers" (
    "id" BIGSERIAL NOT NULL,
    "full_name_ar" TEXT NOT NULL,
    "full_name_en" TEXT,
    "national_id_number" TEXT,
    "nationality" TEXT,
    "birth_date" TIMESTAMP(3),
    "birth_place" TEXT,
    "civil_registry_office" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engineers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diwan_employees" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "job_role" TEXT,
    "username" TEXT,
    "password_hash" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "diwan_employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registry_entries" (
    "id" BIGSERIAL NOT NULL,
    "registry_no" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "from_entity" TEXT,
    "to_entity" TEXT,
    "subject" TEXT,
    "request_type" TEXT,
    "request_id" BIGINT,
    "notes" TEXT,

    CONSTRAINT "registry_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" BIGSERIAL NOT NULL,
    "request_type" TEXT NOT NULL,
    "request_id" BIGINT NOT NULL,
    "document_type" TEXT,
    "file_path" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by_employee_id" INTEGER,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_division_links" (
    "id" BIGSERIAL NOT NULL,
    "request_type" TEXT NOT NULL,
    "request_id" BIGINT NOT NULL,
    "sent_to_office_at" TIMESTAMP(3),
    "office_reply_date" TIMESTAMP(3),
    "office_decision_no" TEXT,
    "office_decision_file_id" BIGINT,
    "notes" TEXT,

    CONSTRAINT "office_division_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engineering_offices" (
    "id" BIGSERIAL NOT NULL,
    "office_name" TEXT NOT NULL,
    "owner_engineer_id" BIGINT,
    "branch_id" INTEGER,
    "office_type" TEXT,
    "specialization" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "license_no" TEXT,
    "license_issue_date" TIMESTAMP(3),
    "license_status" TEXT DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engineering_offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_requests" (
    "id" BIGSERIAL NOT NULL,
    "request_scope" TEXT NOT NULL,
    "inbound_number" TEXT,
    "inbound_date" TIMESTAMP(3),
    "branch_id" INTEGER,
    "engineer_id" BIGINT,
    "full_name_ar" TEXT NOT NULL,
    "first_name_en" TEXT,
    "last_name_en" TEXT,
    "father_name" TEXT,
    "mother_name" TEXT,
    "national_id_number" TEXT,
    "civil_registry_office" TEXT,
    "birth_place" TEXT,
    "birth_date" TIMESTAMP(3),
    "nationality" TEXT,
    "university_name" TEXT,
    "faculty_name" TEXT,
    "degree_title" TEXT,
    "engineering_department" TEXT,
    "specialization" TEXT,
    "academic_year" TEXT,
    "exam_session" TEXT,
    "university_record_no" TEXT,
    "university_council_decision_no" TEXT,
    "university_council_decision_date" TIMESTAMP(3),
    "is_resident_abroad" BOOLEAN NOT NULL DEFAULT false,
    "country" TEXT DEFAULT 'سوريا',
    "home_address" TEXT,
    "work_address" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "laws_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "correspondence_address" TEXT,
    "applicant_signature" TEXT,
    "application_date" TIMESTAMP(3),
    "study_engineer_status" TEXT,
    "study_engineering_department" TEXT,
    "study_specialization" TEXT,
    "study_reference" TEXT,
    "study_notes" TEXT,
    "study_date" TIMESTAMP(3),
    "study_employee_id" INTEGER,
    "branch_decision_number" TEXT,
    "branch_decision_date" TIMESTAMP(3),
    "branch_decision_department" TEXT,
    "branch_decision_specialization" TEXT,
    "oath_invitation_date" TIMESTAMP(3),
    "oath_day" TEXT,
    "oath_date" TIMESTAMP(3),
    "oath_time" TIMESTAMP(3),
    "syndicate_registration_number" TEXT,
    "status" TEXT DEFAULT 'draft',
    "received_by_employee_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "death_aid_forms" (
    "id" BIGSERIAL NOT NULL,
    "membership_request_id" BIGINT NOT NULL,
    "beneficiary1_name" TEXT,
    "beneficiary1_relation" TEXT,
    "beneficiary1_share_percent" DECIMAL(65,30),
    "beneficiary2_name" TEXT,
    "beneficiary2_relation" TEXT,
    "beneficiary2_share_percent" DECIMAL(65,30),
    "beneficiary3_name" TEXT,
    "beneficiary3_relation" TEXT,
    "beneficiary3_share_percent" DECIMAL(65,30),
    "option_a_enabled" BOOLEAN,
    "option_b_enabled" BOOLEAN,
    "pay_to_heirs_as_sharia" BOOLEAN,
    "other_beneficiary1_name" TEXT,
    "other_beneficiary1_relation" TEXT,
    "other_beneficiary1_share_percent" DECIMAL(65,30),
    "notes" TEXT,
    "id_card_number" TEXT,
    "id_card_issued_from" TEXT,
    "id_card_issue_date" TIMESTAMP(3),
    "form_diwane_number" TEXT,
    "form_diwane_date" TIMESTAMP(3),
    "engineer_signature" TEXT,
    "branch_chair_signature" TEXT,

    CONSTRAINT "death_aid_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_documents" (
    "id" BIGSERIAL NOT NULL,
    "membership_request_id" BIGINT NOT NULL,
    "doc_civil_registry_or_id_copy" BOOLEAN,
    "doc_civil_registry_extract_copy" BOOLEAN,
    "doc_engineering_degree_certified" BOOLEAN,
    "doc_degree_translation" BOOLEAN,
    "doc_scientific_baccalaureate" BOOLEAN,
    "doc_engineering_qualification_committee" BOOLEAN,
    "doc_photos_4x3" BOOLEAN,
    "doc_photos_3x2" BOOLEAN,
    "doc_work_permit_non_syrian" BOOLEAN,
    "doc_residence_statement_non_employee" BOOLEAN,
    "doc_fees_paid_confirmation" BOOLEAN,
    "checked_by_employee_id" INTEGER,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_fees" (
    "id" BIGSERIAL NOT NULL,
    "membership_request_id" BIGINT NOT NULL,
    "registration_annual_fee" DECIMAL(65,30),
    "registration_idcard_fee" DECIMAL(65,30),
    "registration_total" DECIMAL(65,30),
    "death_aid_membership_fee" DECIMAL(65,30),
    "death_aid_annual_fee" DECIMAL(65,30),
    "death_aid_total" DECIMAL(65,30),
    "retirement_membership_fee" DECIMAL(65,30),
    "retirement_annual_fee" DECIMAL(65,30),
    "retirement_total" DECIMAL(65,30),
    "receipt_branch_fee_number" TEXT,
    "receipt_branch_fee_date" TIMESTAMP(3),
    "receipt_death_aid_number" TEXT,
    "receipt_death_aid_date" TIMESTAMP(3),
    "receipt_retirement_number" TEXT,
    "receipt_retirement_date" TIMESTAMP(3),
    "treasurer_employee_id" INTEGER,

    CONSTRAINT "membership_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_requests" (
    "id" BIGSERIAL NOT NULL,
    "engineer_id" BIGINT NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "request_date" TIMESTAMP(3),
    "host_office_id" BIGINT,
    "host_engineer_name" TEXT,
    "host_office_name" TEXT,
    "host_office_address" TEXT,
    "host_office_specialization" TEXT,
    "host_office_registration_no" TEXT,
    "planned_training_duration_months" INTEGER,
    "has_previous_practice" BOOLEAN,
    "notes_from_branch" TEXT,
    "law_declaration_signed" BOOLEAN,
    "law_declaration_date" TIMESTAMP(3),
    "law_declaration_home_address" TEXT,
    "office_approval_date" TIMESTAMP(3),
    "office_approval_notes" TEXT,
    "training_size" TEXT,
    "office_division_decision_summary" TEXT,
    "status" TEXT DEFAULT 'waiting_office',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_opening_requests" (
    "id" BIGSERIAL NOT NULL,
    "engineer_id" BIGINT NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "request_date" TIMESTAMP(3),
    "office_name" TEXT,
    "office_type" TEXT,
    "specialization" TEXT,
    "office_address" TEXT,
    "office_phone" TEXT,
    "law_declaration_signed" BOOLEAN,
    "law_declaration_date" TIMESTAMP(3),
    "law_declaration_home_address" TEXT,
    "office_division_decision_no" TEXT,
    "office_division_decision_date" TIMESTAMP(3),
    "resulting_office_id" BIGINT,
    "status" TEXT DEFAULT 'under_review',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "office_opening_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_requests" (
    "id" BIGSERIAL NOT NULL,
    "engineer_id" BIGINT NOT NULL,
    "branch_id" INTEGER NOT NULL,
    "target_rank" TEXT NOT NULL,
    "register_number" TEXT,
    "request_date" TIMESTAMP(3),
    "specialization" TEXT,
    "work_address" TEXT,
    "residence_address" TEXT,
    "phone" TEXT,
    "membership_accept_decision_no" TEXT,
    "membership_accept_decision_date" TIMESTAMP(3),
    "membership_accept_branch" TEXT,
    "last_modification_decision_no" TEXT,
    "last_modification_decision_date" TIMESTAMP(3),
    "last_modification_branch" TEXT,
    "practice_summary_a" TEXT,
    "practice_summary_b" TEXT,
    "theoretical_entitlement_date" TIMESTAMP(3),
    "half_delay_period_months" INTEGER,
    "entitlement_date" TIMESTAMP(3),
    "first_committee_notes" TEXT,
    "second_committee_notes" TEXT,
    "administrative_opinion" TEXT,
    "branch_council_decision" TEXT,
    "branch_council_decision_date" TIMESTAMP(3),
    "promotion_effective_date" TIMESTAMP(3),
    "promotion_fee_amount" DECIMAL(65,30),
    "promotion_fee_receipt_no" TEXT,
    "promotion_fee_receipt_date" TIMESTAMP(3),
    "status" TEXT DEFAULT 'under_review',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_qualifications" (
    "id" BIGSERIAL NOT NULL,
    "promotion_request_id" BIGINT NOT NULL,
    "degree_name" TEXT,
    "obtained_date" TIMESTAMP(3),
    "specialization" TEXT,
    "university_and_faculty" TEXT,

    CONSTRAINT "promotion_qualifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_experiences" (
    "id" BIGSERIAL NOT NULL,
    "promotion_request_id" BIGINT NOT NULL,
    "from_year" INTEGER,
    "to_year" INTEGER,
    "employer" TEXT,
    "job_title_and_work_type" TEXT,

    CONSTRAINT "promotion_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diwan_employees_username_key" ON "diwan_employees"("username");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_uploaded_by_employee_id_fkey" FOREIGN KEY ("uploaded_by_employee_id") REFERENCES "diwan_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_division_links" ADD CONSTRAINT "office_division_links_office_decision_file_id_fkey" FOREIGN KEY ("office_decision_file_id") REFERENCES "attachments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engineering_offices" ADD CONSTRAINT "engineering_offices_owner_engineer_id_fkey" FOREIGN KEY ("owner_engineer_id") REFERENCES "engineers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "engineers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_received_by_employee_id_fkey" FOREIGN KEY ("received_by_employee_id") REFERENCES "diwan_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_requests" ADD CONSTRAINT "membership_requests_study_employee_id_fkey" FOREIGN KEY ("study_employee_id") REFERENCES "diwan_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "death_aid_forms" ADD CONSTRAINT "death_aid_forms_membership_request_id_fkey" FOREIGN KEY ("membership_request_id") REFERENCES "membership_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_documents" ADD CONSTRAINT "membership_documents_membership_request_id_fkey" FOREIGN KEY ("membership_request_id") REFERENCES "membership_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_documents" ADD CONSTRAINT "membership_documents_checked_by_employee_id_fkey" FOREIGN KEY ("checked_by_employee_id") REFERENCES "diwan_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_membership_request_id_fkey" FOREIGN KEY ("membership_request_id") REFERENCES "membership_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "membership_fees" ADD CONSTRAINT "membership_fees_treasurer_employee_id_fkey" FOREIGN KEY ("treasurer_employee_id") REFERENCES "diwan_employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_requests" ADD CONSTRAINT "training_requests_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_requests" ADD CONSTRAINT "training_requests_host_office_id_fkey" FOREIGN KEY ("host_office_id") REFERENCES "engineering_offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_opening_requests" ADD CONSTRAINT "office_opening_requests_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_opening_requests" ADD CONSTRAINT "office_opening_requests_resulting_office_id_fkey" FOREIGN KEY ("resulting_office_id") REFERENCES "engineering_offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_requests" ADD CONSTRAINT "promotion_requests_engineer_id_fkey" FOREIGN KEY ("engineer_id") REFERENCES "engineers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_qualifications" ADD CONSTRAINT "promotion_qualifications_promotion_request_id_fkey" FOREIGN KEY ("promotion_request_id") REFERENCES "promotion_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_experiences" ADD CONSTRAINT "promotion_experiences_promotion_request_id_fkey" FOREIGN KEY ("promotion_request_id") REFERENCES "promotion_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
