-- =============================================================================
-- KTU ACTIVITY POINTS — SINGLE JSONB RULEBOOK TABLE
-- Drop-in for Supabase. Read-only config; updates are rare.
-- =============================================================================

CREATE TABLE IF NOT EXISTS activity_rulebook (
  id          INT  PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton row
  scheme      TEXT NOT NULL,
  version     TEXT NOT NULL,
  data        JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Public read, only service_role can write
ALTER TABLE activity_rulebook ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read rulebook"
  ON activity_rulebook FOR SELECT USING (TRUE);

CREATE POLICY "Service role can update rulebook"
  ON activity_rulebook FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for common JSONB lookups
CREATE INDEX idx_rulebook_groups
  ON activity_rulebook USING GIN ((data->'groups'));

CREATE INDEX idx_rulebook_categories
  ON activity_rulebook USING GIN ((data->'categories'));

CREATE INDEX idx_rulebook_data
  ON activity_rulebook USING GIN (data);

-- =============================================================================
-- INSERT — Full KTU 2024 Rulebook
-- =============================================================================
INSERT INTO activity_rulebook (id, scheme, version, data) VALUES (
1,
'KTU 2024 Scheme',
'1.0',
$RULEBOOK$
{
  "metadata": {
    "scheme": "KTU 2024 Scheme",
    "version": "1.0",
    "lastUpdated": "2026-01-16",
    "applicableProgrammes": ["B.Tech", "B.Des", "BBA", "BCA"]
  },

  "studentCategories": {
    "regular":      { "totalRequired": 120, "perGroupMin": 40, "creditsRequired": 3 },
    "lateralEntry": { "totalRequired": 90,  "perGroupMin": 30, "creditsRequired": 3 },
    "pwd":          { "totalRequired": 60,  "perGroupMin": 20, "creditsRequired": 3 }
  },

  "groups": [
    { "groupId": "GROUP_I",   "groupName": "Sports, Arts, Cultural & Community Activities",   "maxCounted": 40 },
    { "groupId": "GROUP_II",  "groupName": "Technical, Professional & Leadership Activities", "maxCounted": 40 },
    { "groupId": "GROUP_III", "groupName": "Innovation, Research & Advanced Achievements",    "maxCounted": 40 }
  ],

  "globalRules": [
    { "ruleId": "WIN_OVERRIDES_PARTICIPATION",    "description": "If a student wins, only winning points are awarded — not combined with participation." },
    { "ruleId": "HIGHEST_LEVEL_ONLY",             "description": "Only the highest event level achieved is counted." },
    { "ruleId": "DURING_PROGRAMME_ONLY",          "description": "Only activities completed during the programme period are eligible." },
    { "ruleId": "ONE_TIME",                       "description": "Points can be claimed only once regardless of repetitions." },
    { "ruleId": "PER_EVENT",                      "description": "Points awarded per qualifying event, subject to the overall maximum." },
    { "ruleId": "PER_DONATION",                   "description": "Points awarded per qualifying blood donation." },
    { "ruleId": "PER_SEMESTER",                   "description": "Points awarded per semester of qualifying participation." },
    { "ruleId": "PER_ACADEMIC_YEAR",              "description": "Points awarded per academic year of qualifying participation." },
    { "ruleId": "PER_TRAINING",                   "description": "Points awarded per qualifying training programme." },
    { "ruleId": "HIGHEST_MILESTONE_ONLY",         "description": "Only the highest achieved milestone is counted." },
    { "ruleId": "HIGHEST_PRIZE_ONLY",             "description": "Only the highest prize position is counted for a given event." },
    { "ruleId": "HIGHEST_SCORE_ONLY",             "description": "Only the highest score/band is used across multiple attempts." },
    { "ruleId": "UNIVERSITY_APPROVED_LIST_ONLY",  "description": "No points for courses not in the University approved list." },
    { "ruleId": "MULTIPLE_COURSES_ALLOWED",       "description": "Students may complete multiple approved courses to accumulate points." },
    { "ruleId": "MAX_5_PER_MAGAZINE_PER_YEAR",    "description": "Maximum 5 points per college magazine per academic year." },
    { "ruleId": "MAX_2_COORDINATORS_PER_CLASS",   "description": "Maximum 2 coordinators recognised per class." },
    { "ruleId": "MAX_2_COORDINATORS_ATLEAST_1_FEMALE", "description": "Maximum 2 coordinators; at least one shall be female." },
    { "ruleId": "MAX_8_STUDENTS_PER_YEAR",        "description": "Points awarded to a maximum of 8 students per academic year." },
    { "ruleId": "ONE_PER_CLASS",                  "description": "Only one student per class is eligible per year." },
    { "ruleId": "MIN_CLASS_STRENGTH_30",          "description": "Minimum class strength of 30 students required." },
    { "ruleId": "PER_EVENT_FOR_COORDINATOR",      "description": "5 points per event coordinated, subject to overall cap." },
    { "ruleId": "PER_ACADEMIC_YEAR_FOR_EXEC",     "description": "Points for executive/office-bearer roles awarded per academic year." }
  ],

  "capGroups": [
    {
      "capId": "COMMUNITY_SERVICE_CAP",
      "description": "Activities 1.6 and 1.7 together are capped at 10 points",
      "activityIds": ["COMMUNITY_2DAY", "COMMUNITY_WEEK"],
      "maxPoints": 10
    },
    {
      "capId": "NSS_NCC_CLUSTER",
      "description": "Activities 1.11 through 1.19 combined cap at 40 points",
      "activityIds": [
        "NSS_VOLUNTEER_2YR", "NSS_LEADERSHIP_CAMP", "NSS_STATE_WINNER",
        "NSS_SPECIAL_SERVICE", "NSS_STATE_NATIONAL_AWARD", "NSS_NATIONAL_CAMPS",
        "NSS_VOLUNTEER_10DAY", "NSS_RDC_IDC", "NCC_CERTIFICATES"
      ],
      "maxPoints": 40
    }
  ],

  "categories": [

    {
      "categoryId": "sports_arts_cultural",
      "categoryName": "Sports, Arts & Cultural Activities",
      "groupId": "GROUP_I",
      "activities": [
        {
          "activityId": "SPORTS_PARTICIPATION",
          "code": "1.1",
          "title": "Sports / Games / Arts – Participation",
          "calculationType": "LEVEL",
          "levels": { "college": 1, "zonal": 5, "state": 10, "national": 20, "international": 40 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificates issued by the hosting college, University, Dean (Student Affairs), College Union Advisor, staff-in-charge, or recognized professional bodies.",
          "remarks": "KTU Organized/Approved Events only."
        },
        {
          "activityId": "SPORTS_WINNER_SINGLE",
          "code": "1.2",
          "title": "Sports / Games / Arts – Winners (1st, 2nd, 3rd) – Single Events",
          "calculationType": "LEVEL",
          "levels": { "college": 5, "zonal": 10, "state": 20, "national": 40, "international": 40 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificates issued by the hosting college, University, Dean (Student Affairs), College Union Advisor, staff-in-charge, or recognized professional bodies.",
          "remarks": "KTU Organized/Approved Events only."
        },
        {
          "activityId": "SPORTS_WINNER_GROUP",
          "code": "1.3",
          "title": "Sports / Games / Arts – Winners (1st, 2nd, 3rd) – Group Events",
          "calculationType": "LEVEL",
          "levels": { "college": 3, "zonal": 5, "state": 15, "national": 30, "international": 40 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificates issued by the hosting college, University, Dean (Student Affairs), College Union Advisor, staff-in-charge, or recognized professional bodies.",
          "remarks": "KTU Organized/Approved Events only."
        },
        {
          "activityId": "COLLEGE_MAGAZINE_PUB",
          "code": "1.4",
          "title": "Publication in College Magazine",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 20,
          "rules": ["MAX_5_PER_MAGAZINE_PER_YEAR"],
          "documentaryEvidence": "Copy of the publication or certification from the Editorial Committee.",
          "remarks": "Max 5 points per magazine per academic year. Overall max 20 points."
        },
        {
          "activityId": "FOUR_WHEELER_LICENSE",
          "code": "1.5",
          "title": "Four-Wheeler Driving License",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 5,
          "rules": ["DURING_PROGRAMME_ONLY", "ONE_TIME"],
          "documentaryEvidence": "Copy of the Driving License clearly showing the issue date.",
          "remarks": "License must be obtained during the original programme duration."
        }
      ]
    },

    {
      "categoryId": "community_outreach",
      "categoryName": "Community Outreach & Social Initiatives",
      "groupId": "GROUP_I",
      "activities": [
        {
          "activityId": "COMMUNITY_2DAY",
          "code": "1.6",
          "title": "Community Service & Allied Activities (Two Days)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 10,
          "rules": [],
          "documentaryEvidence": "Certificates issued by NSS Programme Officer, Faculty Coordinator, or authorized officials of Government departments, Local Bodies, or NGOs.",
          "remarks": "Special pandemic/disaster volunteer service: 5 Points. Cap shared with 1.7 at 10 points total."
        },
        {
          "activityId": "COMMUNITY_WEEK",
          "code": "1.7",
          "title": "Community Service & Allied Activities (Up to One Week)",
          "calculationType": "FIXED",
          "points": 10,
          "maxPoints": 10,
          "rules": [],
          "documentaryEvidence": "Certificates issued by NSS Programme Officer, Faculty Coordinator, or authorized officials of Government departments, Local Bodies, or NGOs.",
          "remarks": "Special pandemic/disaster volunteer service: 10 Points. Cap shared with 1.6 at 10 points total."
        },
        {
          "activityId": "BLOOD_DONATION",
          "code": "1.8",
          "title": "Blood Donation",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 10,
          "rules": ["PER_DONATION"],
          "documentaryEvidence": "Certificates issued by a Government Blood Bank, Medical College Blood Bank, District Hospital Blood Bank, or any hospital licensed by the State Blood Transfusion Council.",
          "remarks": "5 Points per donation. Maximum 10 points."
        },
        {
          "activityId": "THRIVE_PROJECT",
          "code": "1.9",
          "title": "THRIVE Project – Minimum 5 days in a semester",
          "calculationType": "FIXED",
          "points": 10,
          "maxPoints": 20,
          "rules": ["PER_SEMESTER"],
          "documentaryEvidence": "Certificate from the THRIVE programme authority.",
          "remarks": "10 Points per semester. Maximum 20 points."
        },
        {
          "activityId": "TREE_PLANTING",
          "code": "1.10",
          "title": "Tree Planting by Students",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 5,
          "rules": ["ONE_TIME"],
          "documentaryEvidence": "Tree geo-tagging certificate issued by the University NSS Cell.",
          "remarks": "Maximum 5 points."
        }
      ]
    },

    {
      "categoryId": "nss_ncc",
      "categoryName": "NSS / NCC",
      "groupId": "GROUP_I",
      "activities": [
        {
          "activityId": "NSS_VOLUNTEER_2YR",
          "code": "1.11",
          "title": "NSS Volunteer – Two years of volunteership as per NSS Manual",
          "calculationType": "FIXED",
          "points": 30,
          "maxPoints": 30,
          "rules": ["ONE_TIME"],
          "documentaryEvidence": "NSS Volunteership Certificate issued by the University NSS Cell."
        },
        {
          "activityId": "NSS_LEADERSHIP_CAMP",
          "code": "1.12",
          "title": "University Level Leadership Camps (100 hours camp)",
          "calculationType": "FIXED",
          "points": 20,
          "maxPoints": 20,
          "rules": [],
          "documentaryEvidence": "Certificate issued by the University NSS Cell."
        },
        {
          "activityId": "NSS_STATE_WINNER",
          "code": "1.13",
          "title": "Winners in State Level NSS Festival / State NSS Meet / NSS Competitions (1st, 2nd)",
          "calculationType": "FIXED",
          "points": 15,
          "maxPoints": 15,
          "rules": [],
          "documentaryEvidence": "Certificate issued by the University / State NSS Cell / NCC Directorate."
        },
        {
          "activityId": "NSS_SPECIAL_SERVICE",
          "code": "1.14",
          "title": "Special Service Certificate or Appreciation – State Government / State NSS Cell / NCC Directorate",
          "calculationType": "FIXED",
          "points": 15,
          "maxPoints": 15,
          "rules": [],
          "documentaryEvidence": "Certificate issued by the University / State NSS Cell / NCC Directorate."
        },
        {
          "activityId": "NSS_STATE_NATIONAL_AWARD",
          "code": "1.15",
          "title": "Recipient of State / National Level Awards",
          "calculationType": "LEVEL",
          "levels": { "state": 15, "national": 25 },
          "maxPoints": 40,
          "rules": ["HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificate issued by the University / State NSS Cell / NCC Directorate.",
          "remarks": "State awards – 15 Points; National level awards – 25 Points."
        },
        {
          "activityId": "NSS_NATIONAL_CAMPS",
          "code": "1.16",
          "title": "Attending Approved National Camps / NIC / NYF / Pre-RDC",
          "calculationType": "FIXED",
          "points": 15,
          "maxPoints": 15,
          "rules": [],
          "documentaryEvidence": "Certificate issued by the University / State NSS Cell / NCC Directorate."
        },
        {
          "activityId": "NSS_VOLUNTEER_10DAY",
          "code": "1.17",
          "title": "Ten Days Minimum Volunteer Service (50 hours) – State official programme or State NSS/NCC special projects",
          "calculationType": "FIXED",
          "points": 15,
          "maxPoints": 15,
          "rules": [],
          "documentaryEvidence": "Certificate issued by the University / State NSS Cell / NCC Directorate."
        },
        {
          "activityId": "NSS_RDC_IDC",
          "code": "1.18",
          "title": "Participation in Republic Day Camp (RDC) or Independence Day Camp (IDC) or International events approved by NSS/NCC",
          "calculationType": "FIXED",
          "points": 25,
          "maxPoints": 25,
          "rules": [],
          "documentaryEvidence": "Certificate issued by the University / State NSS Cell / NCC Directorate."
        },
        {
          "activityId": "NCC_CERTIFICATES",
          "code": "1.19",
          "title": "NCC Certificates",
          "calculationType": "LEVEL",
          "levels": { "ncc_b": 20, "ncc_c": 30, "one_year_parade": 10 },
          "maxPoints": 30,
          "rules": ["HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificate issued by the University / NCC Directorate.",
          "remarks": "NCC B – 20 Pts; NCC C – 30 Pts; One Year NCC + Minimum Parade – 10 Pts."
        }
      ]
    },

    {
      "categoryId": "health_life_skills",
      "categoryName": "Health, Safety & Essential Life Skills",
      "groupId": "GROUP_I",
      "activities": [
        {
          "activityId": "FIRST_AID_CPR",
          "code": "1.20",
          "title": "Emergency Response, First Aid, CPR & Fire Safety Training (Minimum half-day certified programme)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 10,
          "rules": ["PER_TRAINING"],
          "documentaryEvidence": "Certificates issued by Government organizations, Fire & Rescue Services, approved training agencies, or registered hospitals.",
          "remarks": "5 Points per training programme. Maximum 10 points."
        },
        {
          "activityId": "SWIMMING",
          "code": "1.21",
          "title": "Basic Swimming Proficiency",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 5,
          "rules": ["ONE_TIME"],
          "documentaryEvidence": "Certificates issued by Panchayat/Municipality swimming instructors, Kerala State Sports Council coaches, or registered swimming academies."
        }
      ]
    },

    {
      "categoryId": "technical_competitions",
      "categoryName": "Technical Events, Competitions & Academic Presentations",
      "groupId": "GROUP_II",
      "activities": [
        {
          "activityId": "TECHFEST_PARTICIPATION",
          "code": "2.1",
          "title": "Tech-Fest – Participation (Organized or Approved by KTU)",
          "calculationType": "LEVEL",
          "levels": { "college": 2, "zonal": 5, "state": 10, "national": 20, "international": 30 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, Staff-in-Charge of the Professional Society Chapter, or College Union Advisor, verified by SFA."
        },
        {
          "activityId": "TECHFEST_WINNER",
          "code": "2.2",
          "title": "Tech-Fest – Winners (Organized or Approved by KTU)",
          "calculationType": "LEVEL",
          "levels": { "college": 5, "zonal": 10, "state": 20, "national": 40, "international": 40 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, Staff-in-Charge of the Professional Society Chapter, or College Union Advisor, verified by SFA."
        },
        {
          "activityId": "PROFSOC_PARTICIPATION",
          "code": "2.3",
          "title": "Technical Competitions by Professional Societies (IEEE, IET, ASME, SAE, etc.) – Participation",
          "calculationType": "LEVEL",
          "levels": { "college": 2, "zonal": 5, "state": 10, "national": 15, "international": 20 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA."
        },
        {
          "activityId": "PROFSOC_WINNER",
          "code": "2.4",
          "title": "Technical Competitions by Professional Societies (IEEE, IET, ASME, SAE, etc.) – Winners (1st, 2nd, 3rd)",
          "calculationType": "LEVEL",
          "levels": { "college": 3, "zonal": 7, "state": 15, "national": 25, "international": 35 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA."
        },
        {
          "activityId": "CONFERENCE_SEMINAR",
          "code": "2.5",
          "title": "Attending full-time Conferences, Seminars, Webinars, Workshops, STTPs at IITs/IIITs/NITs/Central Universities/NIRF Top 100 (Excluding fest activities like Ragam)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 15,
          "rules": ["PER_EVENT"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA.",
          "remarks": "5 Points per event. Maximum 15 points."
        },
        {
          "activityId": "POSTER_PARTICIPATION",
          "code": "2.6",
          "title": "Poster Presentation – Participation (KTU approved / IITs / IIITs / NITs / Central Universities / NIRF Top 100)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 40,
          "rules": ["PER_EVENT"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA."
        },
        {
          "activityId": "PAPER_PRES_TOPINST_PARTICIPATION",
          "code": "2.7",
          "title": "Paper Presentation – Participation (KTU / IITs / IIITs / NITs / Central Universities / NIRF Top 100)",
          "calculationType": "FIXED",
          "points": 10,
          "maxPoints": 40,
          "rules": ["PER_EVENT"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA."
        },
        {
          "activityId": "PAPER_PRES_TOPINST_WINNER",
          "code": "2.8",
          "title": "Paper Presentation – Winners (KTU / IITs / IIITs / NITs / Central Universities / NIRF Top 100)",
          "calculationType": "PRIZE",
          "prizes": { "first": 20, "second_third": 15 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA."
        },
        {
          "activityId": "PAPER_PRES_KTU_PARTICIPATION",
          "code": "2.9",
          "title": "Paper Presentation – Participation (KTU Affiliated institutions)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 40,
          "rules": ["PER_EVENT"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA."
        },
        {
          "activityId": "PAPER_PRES_KTU_WINNER",
          "code": "2.10",
          "title": "Paper Presentation – Winners (KTU Affiliated institutions)",
          "calculationType": "PRIZE",
          "prizes": { "first": 10, "second_third": 7 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION"],
          "documentaryEvidence": "Certificates issued by the Organizing Institution, verified by the SFA."
        }
      ]
    },

    {
      "categoryId": "leadership_management",
      "categoryName": "Leadership & Management",
      "groupId": "GROUP_II",
      "activities": [
        {
          "activityId": "PROF_SOCIETY_MEMBERSHIP",
          "code": "2.11",
          "title": "Membership in Student Professional Societies (IEEE, IET, ASME, SAE, ACM, ASCE, ISA, etc.) – Minimum 2 Academic Years",
          "calculationType": "ROLE",
          "roles": {
            "member": 5,
            "executive_committee": 10,
            "secretary_chapter_lead_chair": 15,
            "event_coordinator": 5
          },
          "maxPoints": 15,
          "rules": ["PER_EVENT_FOR_COORDINATOR"],
          "documentaryEvidence": "Membership certificate or letter from the professional society chapter.",
          "remarks": "Student Coordinator for an event: 5 points per event."
        },
        {
          "activityId": "COLLEGE_UNION",
          "code": "2.12",
          "title": "College Union Members",
          "calculationType": "ROLE",
          "roles": {
            "office_bearer": 20,
            "executive_committee_excl_office_bearer": 15,
            "university_union_office_bearer": 30,
            "university_union_member_excl_office_bearer": 25
          },
          "maxPoints": 30,
          "rules": [],
          "documentaryEvidence": "Certificate from the College Union Advisor."
        },
        {
          "activityId": "DEPT_STUDENT_ASSOC",
          "code": "2.13",
          "title": "Department Student Association Activities",
          "calculationType": "ROLE",
          "roles": {
            "executive_committee_office_bearer": 5,
            "event_coordinator": 5
          },
          "maxPoints": 10,
          "rules": ["PER_ACADEMIC_YEAR_FOR_EXEC", "PER_EVENT_FOR_COORDINATOR"],
          "documentaryEvidence": "Certificate from the HOD.",
          "remarks": "Exec/Office Bearer – 5 pts/year; Event Coordinator – 5 pts/event."
        },
        {
          "activityId": "CLASS_REPRESENTATIVE",
          "code": "2.14",
          "title": "Class Representatives",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 10,
          "rules": ["PER_ACADEMIC_YEAR", "ONE_PER_CLASS"],
          "documentaryEvidence": "Certificate from the SFA.",
          "remarks": "5 Points per Academic Year. 1 Class Representative per class."
        },
        {
          "activityId": "INDUSTRIAL_VISIT_COORDINATOR",
          "code": "2.15",
          "title": "Industrial Visit Coordinators (Minimum 6 Days)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 5,
          "rules": ["MAX_2_COORDINATORS_PER_CLASS"],
          "documentaryEvidence": "Certificate from the faculty in charge."
        },
        {
          "activityId": "PLACEMENT_CELL",
          "code": "2.16",
          "title": "Placement Cell (Minimum period of one Academic Year)",
          "calculationType": "ROLE",
          "roles": {
            "executive_committee_member": 5,
            "coordinator_convenor": 10
          },
          "maxPoints": 10,
          "rules": ["MAX_2_COORDINATORS_ATLEAST_1_FEMALE"],
          "documentaryEvidence": "Certificates issued by the Staff-in-Charge of the CGPU.",
          "remarks": "Exec Member – 5 pts (one/class); Coordinator/Convenor – 10 pts. Max 2 coordinators, at least 1 female."
        },
        {
          "activityId": "IEDC_CELL",
          "code": "2.17",
          "title": "IEDC Cell (Minimum period of one Academic Year)",
          "calculationType": "ROLE",
          "roles": {
            "executive_committee_office_bearer": 5,
            "event_coordinator": 5
          },
          "maxPoints": 10,
          "rules": ["PER_ACADEMIC_YEAR_FOR_EXEC", "PER_EVENT_FOR_COORDINATOR"],
          "documentaryEvidence": "Certificates issued by the Staff-in-Charge of the IEDC Cell."
        },
        {
          "activityId": "YIP_GRP2",
          "code": "2.18",
          "title": "YIP – Young Innovators Programme (K-DISC) – Minimum 1 Academic Year",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 10,
          "rules": [],
          "documentaryEvidence": "Certificates issued by KDISC or authorized officials of the YIP Programme.",
          "remarks": "Student Coordinator: 5 Points."
        },
        {
          "activityId": "STRIDE_GRP2",
          "code": "2.19",
          "title": "STRIDE – Social Technology & Research for Inclusive Design Excellence (K-DISC) – Minimum 1 Academic Year",
          "calculationType": "ROLE",
          "roles": {
            "certified_volunteer_1yr": 5,
            "membership": 5,
            "leadership_team_role": 10,
            "high_impact_project_l1": 10,
            "high_impact_project_l2": 15,
            "high_impact_project_l5": 20
          },
          "maxPoints": 20,
          "rules": [],
          "documentaryEvidence": "Certificates issued by KDISC or authorized officials of the STRIDE Programme.",
          "remarks": "Certified Volunteer: 5 Pts; Membership: 5 Pts; Leadership Team: 10 Pts; Project L1/L2/L5: 10/15/20 Pts."
        },
        {
          "activityId": "MAGAZINE_EDITORIAL",
          "code": "2.20",
          "title": "College Magazine Editorial Board (Other than the Magazine Editor)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 10,
          "rules": ["MAX_8_STUDENTS_PER_YEAR"],
          "documentaryEvidence": "Certificate from the staff in charge of the Editorial Committee or from the College Union Advisor."
        },
        {
          "activityId": "HOBBY_CLUBS",
          "code": "2.21",
          "title": "Hobby Clubs under College Union (Photography, Film, Music, Dance, Literary, Debate, Coding, Nature Clubs, etc.)",
          "calculationType": "ROLE",
          "roles": { "executive_committee_convenor": 5 },
          "maxPoints": 10,
          "rules": ["PER_ACADEMIC_YEAR"],
          "documentaryEvidence": "Certificate from the staff in charge of the Club and from the College Union Advisor.",
          "remarks": "Executive Committee Members/Convenors – 5 Points per Academic Year."
        }
      ]
    },

    {
      "categoryId": "foss_opensource",
      "categoryName": "FOSS Activities & Open-Source Contributions",
      "groupId": "GROUP_II",
      "activities": [
        {
          "activityId": "FOSS_ACTIVITIES",
          "code": "2.22",
          "title": "ICFOSS / FOSS Club Activities – Minimum Period of 1 Academic Year",
          "calculationType": "MULTI_OPTION",
          "options": [
            { "optionId": "FOSS_CLUB_MEMBER",       "description": "FOSS Club Member – participated in at least 2 club activities", "points": 5 },
            { "optionId": "FOSS_CLUB_LEAD",          "description": "FOSS Club Student Lead / FOSS Coordinator / Ambassador",        "points": 10 },
            { "optionId": "FOSS_WORKSHOP",           "description": "ICFOSS approved Workshops / Bootcamps (minimum 2 days)",        "points": 5 },
            { "optionId": "FOSS_HACKATHON",          "description": "ICFOSS Hackathons / FOSS Events",                               "points": 5 },
            { "optionId": "FOSS_OPENSOURCE_CONTRIB", "description": "Contribution to Open-Source Projects (validated by ICFOSS)",    "points": 10 },
            { "optionId": "FOSS_PROJECT_DEV",        "description": "FOSS Project Development under ICFOSS / internships (min 15 days)", "points": 10 }
          ],
          "maxPoints": 20,
          "rules": [],
          "documentaryEvidence": "Certificates issued by ICFOSS, approved event organizers, or the faculty-in-Charge of the FOSS Club."
        }
      ]
    },

    {
      "categoryId": "short_term_internship",
      "categoryName": "Short-Term Internship",
      "groupId": "GROUP_II",
      "activities": [
        {
          "activityId": "SHORT_INTERNSHIP",
          "code": "2.23",
          "title": "Short-Term Internship / Clinical Exposure Training (Minimum 2 Weeks or 10 Working Days)",
          "calculationType": "FIXED",
          "points": 10,
          "maxPoints": 10,
          "rules": [],
          "documentaryEvidence": "Certificates issued by the organization, company, or institution where the student underwent the internship or clinical exposure."
        }
      ]
    },

    {
      "categoryId": "proficiency_certifications",
      "categoryName": "Standardized Tests & Proficiency Certifications",
      "groupId": "GROUP_II",
      "activities": [
        {
          "activityId": "ENGLISH_PROFICIENCY",
          "code": "2.24",
          "title": "English Proficiency Certifications (TOEFL, IELTS, PTE, BEC)",
          "calculationType": "SCORE_BAND",
          "scoreBands": {
            "TOEFL_IBT":    [ { "min": 105,              "points": 30 }, { "min": 95,  "max": 104, "points": 25 }, { "min": 80, "max": 94, "points": 20 } ],
            "IELTS_ACADEMIC":[ { "min": 7.5,             "points": 30 }, { "min": 7.0, "max": 7.0, "points": 25 }, { "min": 6.5,"max": 6.5,"points": 20 } ],
            "PTE_ACADEMIC":  [ { "min": 76,              "points": 30 }, { "min": 65,  "max": 75,  "points": 25 }, { "min": 58, "max": 64, "points": 20 } ],
            "BEC_CAMBRIDGE": [ { "level": "higher_c1",   "points": 25 }, { "level": "vantage_b2",  "points": 20 }, { "level": "preliminary_b1", "points": 15 } ]
          },
          "maxPoints": 30,
          "rules": ["DURING_PROGRAMME_ONLY", "HIGHEST_SCORE_ONLY"],
          "documentaryEvidence": "Original score report or downloadable digital scorecard issued by the official testing authority.",
          "remarks": "Only tests taken during the student's original programme duration will be considered."
        },
        {
          "activityId": "APTITUDE_PROFICIENCY",
          "code": "2.25",
          "title": "Aptitude Proficiency Certifications (GRE, GATE, CAT, GMAT)",
          "calculationType": "SCORE_BAND",
          "scoreBands": {
            "GRE":  [ { "min": 320, "points": 30 }, { "min": 310, "max": 319, "points": 25 }, { "min": 300, "max": 309, "points": 20 } ],
            "GATE": [ { "airMax": 5000, "points": 30 }, { "airMin": 5001, "airMax": 15000, "points": 25 }, { "qualified": true, "points": 20 } ],
            "CAT":  [ { "minPercentile": 95, "points": 30 }, { "minPercentile": 90, "maxPercentile": 94, "points": 25 }, { "minPercentile": 85, "maxPercentile": 89, "points": 20 } ],
            "GMAT": [ { "min": 700, "points": 30 }, { "min": 650, "max": 699, "points": 25 }, { "min": 600, "max": 649, "points": 20 } ]
          },
          "maxPoints": 30,
          "rules": ["DURING_PROGRAMME_ONLY", "HIGHEST_SCORE_ONLY"],
          "documentaryEvidence": "Official scorecard containing score, percentile, test date, and candidate details."
        }
      ]
    },

    {
      "categoryId": "industry_exposure_internships",
      "categoryName": "Industry Exposure, Academic Projects & Internships",
      "groupId": "GROUP_III",
      "activities": [
        {
          "activityId": "INDUSTRIAL_VISIT_REPORT",
          "code": "3.1",
          "title": "Industrial Visit / Industrial Training Report (S5 or S6) – Minimum 4 industries",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 20,
          "rules": [],
          "documentaryEvidence": "Certified by Faculty Coordinators and SFA. Must confirm minimum 4 industries visited with report containing observations, processes, learning outcomes, and photographs."
        },
        {
          "activityId": "BEST_PROJECT_SEMINAR",
          "code": "3.2",
          "title": "Best Mini Project / Best Project / Best Seminar (from each class)",
          "calculationType": "FIXED",
          "points": 5,
          "maxPoints": 5,
          "rules": ["MIN_CLASS_STRENGTH_30"],
          "documentaryEvidence": "Certificate issued by the Coordinator of the Project/Seminar Evaluation Committee, SFA, and HoD.",
          "remarks": "Minimum class strength of 30 required."
        },
        {
          "activityId": "LONG_TERM_INTERNSHIP",
          "code": "3.3",
          "title": "Long-Term Internship – Minimum 3.5 months as per KTU Guidelines",
          "calculationType": "FIXED",
          "points": 15,
          "maxPoints": 15,
          "rules": [],
          "documentaryEvidence": "Internship Completion Certificate mentioning start and end dates (minimum 3.5 months)."
        },
        {
          "activityId": "LEAP_IIT_MADRAS",
          "code": "3.4",
          "title": "LEAP – IIT Madras Incubation Cell Skill Development Bootcamps",
          "calculationType": "MULTI_OPTION",
          "options": [
            { "optionId": "LEAP_BOOTCAMP", "description": "Completion of LEAP Bootcamps (LPB01 & LPB02)", "points": 10 },
            { "optionId": "LEAP_COURSE",   "description": "Completion of LEAP Courses (LP1XX/LP2XX/LP3XX)", "points": 15, "perUnit": "per course" },
            { "optionId": "LEAP_PROJECT",  "description": "Completion of LEAP Project / Prototype by LEAP Mentor", "points": 20 }
          ],
          "maxPoints": 30,
          "rules": [],
          "documentaryEvidence": "Official LEAP Certificate issued by IIT Madras Incubation Cell or certified training partners."
        },
        {
          "activityId": "YIP_GRP3",
          "code": "3.5",
          "title": "YIP – Young Innovators Programme (K-DISC)",
          "calculationType": "MILESTONE",
          "milestones": [
            { "milestoneId": "YIP_IDEA_SUBMITTED",     "description": "Idea Submitted (accepted in YIP portal)",                       "points": 5 },
            { "milestoneId": "YIP_PRELIMINARY_WINNER", "description": "Preliminary Winner (shortlisted for District Round)",            "points": 10 },
            { "milestoneId": "YIP_DISTRICT_WINNER",    "description": "District Level Winner / Finalist (Selected by District Panel)",  "points": 20 },
            { "milestoneId": "YIP_STATE_WINNER",       "description": "State Level Winner",                                             "points": 35 }
          ],
          "maxPoints": 35,
          "rules": ["HIGHEST_MILESTONE_ONLY"],
          "documentaryEvidence": "Certificates issued by KDISC or authorized officials of the YIP Programme."
        },
        {
          "activityId": "STRIDE_GRP3",
          "code": "3.6",
          "title": "STRIDE – Social Technology & Research for Inclusive Design Excellence (K-DISC)",
          "calculationType": "MILESTONE",
          "milestones": [
            { "milestoneId": "STRIDE_IDEA_SUBMITTED", "description": "Idea Submitted (Phase 1 completed)",           "points": 5 },
            { "milestoneId": "STRIDE_TOP100",         "description": "Top 100+ Teams (Selected to Phase-2)",         "points": 10 },
            { "milestoneId": "STRIDE_TOP30",          "description": "Top 30+ Teams (State-Level Finalists, Phase 3)","points": 20 },
            { "milestoneId": "STRIDE_STATE_WINNER",   "description": "State Level Winner",                           "points": 35 }
          ],
          "maxPoints": 35,
          "rules": ["HIGHEST_MILESTONE_ONLY"],
          "documentaryEvidence": "Certificates issued by KDISC or authorized officials of the STRIDE Programme."
        },
        {
          "activityId": "GDC_AI_INTERNSHIP",
          "code": "3.7",
          "title": "GDC AI Workforce Internship Program",
          "calculationType": "MILESTONE",
          "milestones": [
            { "milestoneId": "GDC_GRADING_TEST",          "description": "AI Grading Test Completed",                   "points": 5 },
            { "milestoneId": "GDC_LEARNING_TRACK",        "description": "Learning Track Completed",                    "points": 15 },
            { "milestoneId": "GDC_FELLOWSHIP_COURSEWORK", "description": "Fellowship Track Coursework Completed",        "points": 25 },
            { "milestoneId": "GDC_6MONTH_INTERNSHIP",     "description": "6-Month Internship Completed (GDC Fellow)",   "points": 35 }
          ],
          "maxPoints": 35,
          "rules": ["HIGHEST_MILESTONE_ONLY"],
          "documentaryEvidence": "Certificates issued by AICTE, the official program executor, or the National Health Mission (NHM)."
        },
        {
          "activityId": "ICFOSS_INNOVATION",
          "code": "3.8",
          "title": "ICFOSS – A working FOSS-based solution or innovation certified by ICFOSS",
          "calculationType": "FIXED",
          "points": 25,
          "maxPoints": 25,
          "rules": [],
          "documentaryEvidence": "Certificate issued by ICFOSS."
        }
      ]
    },

    {
      "categoryId": "innovation_entrepreneurship_ipr",
      "categoryName": "Innovation, Entrepreneurship & Intellectual Property (IPR)",
      "groupId": "GROUP_III",
      "activities": [
        {
          "activityId": "STARTUP_REGISTERED",
          "code": "3.9",
          "title": "Start-up Company – Legally Registered (MSME, DPIIT, ROC, Kerala Startup Mission, or recognized Government body)",
          "calculationType": "FIXED",
          "points": 30,
          "maxPoints": 40,
          "rules": [],
          "documentaryEvidence": "Documentary evidence issued by the respective competent authority."
        },
        {
          "activityId": "PATENTS",
          "code": "3.10",
          "title": "Patents",
          "calculationType": "MILESTONE",
          "milestones": [
            { "milestoneId": "PATENT_FILED",     "description": "Patent Filed – Application filed with IPO/WIPO",         "points": 20 },
            { "milestoneId": "PATENT_PUBLISHED",  "description": "Patent Published in Patent Journal",                    "points": 30 },
            { "milestoneId": "PATENT_GRANTED",    "description": "Patent Granted / Approved – legally granted",           "points": 40 },
            { "milestoneId": "PATENT_LICENSED",   "description": "Patent Licensed – Technology licensed to industry/user","points": 40 }
          ],
          "maxPoints": 40,
          "rules": ["HIGHEST_MILESTONE_ONLY"],
          "documentaryEvidence": "Documentary evidence issued by the respective competent authority (IPO/WIPO)."
        },
        {
          "activityId": "PROTOTYPE_DEVELOPMENT",
          "code": "3.11",
          "title": "Prototype Development & Testing – Functional working model validated by the Innovation Cell or approved Government agencies",
          "calculationType": "FIXED",
          "points": 40,
          "maxPoints": 40,
          "rules": [],
          "documentaryEvidence": "Prototype validation certificate or letter issued by the Innovation Cell / Government-approved innovation agencies."
        },
        {
          "activityId": "TECH_ADOPTED_BY_INDUSTRY",
          "code": "3.11b",
          "title": "Innovative Technologies Adopted by Industry – formally adopted/implemented by a reputed industry or organization",
          "calculationType": "FIXED",
          "points": 40,
          "maxPoints": 40,
          "rules": [],
          "documentaryEvidence": "Official adoption letter / certification / MoU / implementation report issued by the industry or authorized organization."
        },
        {
          "activityId": "VENTURE_CAPITAL_FUNDING",
          "code": "3.12",
          "title": "Venture Capital / Angel Funding – Receiving VC or angel investment for a student-developed product or idea",
          "calculationType": "FIXED",
          "points": 40,
          "maxPoints": 40,
          "rules": [],
          "documentaryEvidence": "Funding agreement, sanction letter, or investment confirmation issued by the angel investor or recognized funding body."
        },
        {
          "activityId": "SOCIETAL_INNOVATIONS",
          "code": "3.13",
          "title": "Societal Innovations – Solutions addressing community needs implemented through IEDC, local bodies, or approved Government agencies with measurable impact",
          "calculationType": "FIXED",
          "points": 40,
          "maxPoints": 40,
          "rules": [],
          "documentaryEvidence": "Validation letter issued by IEDC / Local Bodies / Government Departments / NGOs / Approved agencies confirming implementation and measurable social impact."
        }
      ]
    },

    {
      "categoryId": "research_publications",
      "categoryName": "Research Publications & Scholarly Output",
      "groupId": "GROUP_III",
      "activities": [
        {
          "activityId": "JOURNAL_PUBLICATION",
          "code": "3.14",
          "title": "Research Publication in Reputed Journals",
          "calculationType": "LEVEL",
          "levels": { "sci_scie_scopus_q1_q2": 40, "sci_scie_scopus_q3_q4": 25 },
          "maxPoints": 40,
          "rules": ["HIGHEST_LEVEL_ONLY"],
          "documentaryEvidence": "Paper copy or Acceptance Letter from the Editor / Editorial Office."
        }
      ]
    },

    {
      "categoryId": "hackathons",
      "categoryName": "National & International Hackathons",
      "groupId": "GROUP_III",
      "activities": [
        {
          "activityId": "NATIONAL_HACKATHON",
          "code": "3.15",
          "title": "National Hackathons (SIH, KAVACH, MoE, MHA, AICTE, Central Government hackathons, etc.)",
          "calculationType": "PRIZE",
          "prizes": { "first": 40, "second": 35, "third": 30 },
          "maxPoints": 40,
          "rules": ["WIN_OVERRIDES_PARTICIPATION", "HIGHEST_PRIZE_ONLY"],
          "documentaryEvidence": "Certificates issued by the Hackathon Organizing Authority."
        },
        {
          "activityId": "INTERNATIONAL_HACKATHON",
          "code": "3.16",
          "title": "International Hackathons (NASA Space Apps, Microsoft Imagine Cup, Google Solution Challenge, IBM Call for Code, Meta Global Hackathon, etc.)",
          "calculationType": "PRIZE",
          "prizes": { "first": 40, "second_third": 35, "participation": 30 },
          "maxPoints": 40,
          "rules": ["HIGHEST_PRIZE_ONLY"],
          "documentaryEvidence": "Certificates issued by the Hackathon Organizing Authority."
        }
      ]
    },

    {
      "categoryId": "skill_development",
      "categoryName": "Skill Development Courses",
      "groupId": "GROUP_III",
      "activities": [
        {
          "activityId": "SKILLING_CERTIFICATES",
          "code": "3.17",
          "title": "Skilling Certificates (Approved by the University) – SWAYAM/NPTEL, Spoken Tutorial IIT Bombay, KTU-KDISC, and other University-approved courses",
          "calculationType": "HOURS_BASED",
          "pointsPerHour": 1,
          "maxPoints": 40,
          "rules": ["UNIVERSITY_APPROVED_LIST_ONLY", "MULTIPLE_COURSES_ALLOWED"],
          "documentaryEvidence": "Certificates issued by the respective platform or organization. SFA must verify the course is in the University approved list and duration meets required hours.",
          "remarks": "1 Point per hour. No points for unapproved courses. Approved list published separately by the University."
        }
      ]
    }

  ]
}
$RULEBOOK$
);


-- =============================================================================
-- HELPER QUERIES (copy-paste these in your app / Supabase Edge Functions)
-- =============================================================================

-- 1. Get all groups
-- SELECT value FROM activity_rulebook, jsonb_array_elements(data->'groups') AS value;

-- 2. Get all categories for a group
-- SELECT value FROM activity_rulebook,
--   jsonb_array_elements(data->'categories') AS value
-- WHERE value->>'groupId' = 'GROUP_I';

-- 3. Get a single activity by activityId
-- SELECT act FROM activity_rulebook,
--   jsonb_array_elements(data->'categories') AS cat,
--   jsonb_array_elements(cat->'activities')  AS act
-- WHERE act->>'activityId' = 'NCC_CERTIFICATES';

-- 4. Get all activities for a group (flat list)
-- SELECT act FROM activity_rulebook,
--   jsonb_array_elements(data->'categories') AS cat,
--   jsonb_array_elements(cat->'activities')  AS act
-- WHERE cat->>'groupId' = 'GROUP_II';

-- 5. Get cap groups
-- SELECT value FROM activity_rulebook, jsonb_array_elements(data->'capGroups') AS value;

-- 6. Get student category rules
-- SELECT data->'studentCategories'->'regular' FROM activity_rulebook;

-- 7. Update rulebook version (admin only via service_role)
-- UPDATE activity_rulebook SET version = '1.1', updated_at = NOW(),
--   data = data || '{"metadata": {"version": "1.1"}}'::jsonb WHERE id = 1;