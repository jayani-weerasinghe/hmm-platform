**HMM PLATFORM**

**Phase 1 Feature Checklist & Tracker**

Web Application (Super Admin & Champion) \+ Mobile Application (Gatekeeper)

*Version 1.0  |  July 2026  |  Based on Initial Requirement Document v1.0*

# **How to Use This Checklist**

This document breaks down every Phase 1 requirement from the Initial Requirement Document into a trackable checklist, organized by application and role. Use it during sprint planning to confirm scope, assign ownership, and track build status. Each feature includes a checkbox, a suggested priority (Core \= required for Phase 1 launch, Recommended \= suggested add-on, not explicitly requested), and a status column for tracking.

# **1\. Web Application — Super Admin Features**

## **1.1 Authentication & Access**

☐  **Email/password login \- Done**

☐  **Forgot password via email \- Done**

☐  **Change password \- Done**

☐  **Role-based access control (RBAC)**

☐  **Secure logout & idle session expiry \- Done**

## **1.2 Dashboard \- Done**

☐  **Total active Gatekeeper count per club**

☐  **Total active Champions count**

☐  **Club onboarding progress indicator**

☐  **Club-wise Gatekeeper count (active/inactive)**

☐  **Upcoming events count**

☐  **Total QPR-certified Gatekeepers & Champions (system-wide)**

## **1.3 Profile Management \- Done**

☐  **View personal details**

☐  **Update permitted profile info**

☐  **Change password**

☐  **View role & access level**

## **1.4 Resource Management \- Done**

☐  **Upload videos (file or external URL)**

☐  **Upload articles (rich text or link)**

☐  **Upload documents (PDF, Word, other)**

☐  **Title, description, category/tag, publication date per resource**

☐  **Edit / delete resources**

☐  **Resources visible to Champions & Gatekeepers**

## **1.5 Announcement Management \- Done**

☐  **Create / edit / delete / schedule announcements**

☐  **Title, body, publish date, optional expiry date**

☐  **Visible to all platform users**

## **1.6 Event & Calendar \- Done**

☐  **View all scheduled events across clubs**

## **1.7 Club Management \- Done**

☐  **Create club (name, location, details)**

☐  **Edit club details**

☐  **Deactivate club (flags associated Champions/Gatekeepers)**

☐  **View list of all clubs with status & assigned Champions**

## **1.8 Champion Account Management  \- Done**

☐  **Create Champion account & assign to club**

☐  **Auto-generate credentials \+ welcome email**

☐  **Edit Champion details**

☐  **Deactivate Champion account**

☐  **View list of Champions with club & status**

## **1.9 Permission Management**

☐  **Define/update permissions for Champion & Gatekeeper roles**

☐  **Enable/disable permissions per user or as default**

# **2\. Web Application — Champion Features**

## **2.1 Dashboard**

☐  **Active Gatekeeper count (own club)**

☐  **Inactive Gatekeeper count (own club)**

☐  **New Gatekeepers onboarded this month**

☐  **Awareness program summary (upcoming/completed)**

☐  **Onboarding status (added but not yet logged in)**

☐  **QPR-certified count vs. total, for club comparison**

## **2.2 Profile Management**

☐  **View / update personal details**

☐  **Change password**

☐  **View role & access level**

## **2.3 Gatekeeper Management**

☐  **Add Gatekeeper individually**

☐  **Bulk upload Gatekeepers (CSV/Excel)**

☐  **Edit Gatekeeper details**

☐  **Assign Gatekeeper to club**

☐  **Deactivate Gatekeeper**

☐  **View club Gatekeeper list (contact, QPR dates)**

☐  **View individual Gatekeeper profile & QPR status**

## **2.4 Event & Calendar Management**

☐  **Create events (QPR sessions, awareness programs, workshops)**

☐  **Event fields: title, type, date/time, venue, description, max participants**

☐  **Edit / cancel events**

☐  **Shared calendar view (platform-wide)**

☐  **Events visible in Super Admin & Gatekeeper calendars**

## **2.5 Announcement Management**

☐  **Create / edit / delete announcements**

☐  **Title, body, publish date, optional expiry date**

## **2.6 Resource Access**

☐  **Browse resources uploaded by Super Admin**

☐  **View articles / play videos / view or download documents**

☐  **Filter/search resources by title or category**

# **3\. Mobile Application — Gatekeeper Features**

## **3.1 Login & Authentication**

☐  **Login with Champion-issued credentials**

☐  **Secure password reset (email or phone)**

☐  **Remember login option**

## **3.2 Dashboard**

☐  **QPR session summary (cert & expiry date)**

☐  **Upcoming events list**

☐  **Awareness programs joined (history)**

☐  **Latest announcements**

☐  **Total QPR-certified count**

## **3.3 Events & Calendar**

☐  **Full calendar view (all clubs)**

☐  **View event details (title, date, time, venue, description)**

☐  **Express interest / register for event**

☐  **Filter events by type**

## **3.4 Resources**

☐  **View articles / videos / documents**

☐  **Filter/search by title or category**

## **3.5 Announcements**

☐  **View announcements from Super Admin & Champions**

☐  **Clear, accessible announcements section**

## **3.6 Profile Page**

☐  **View personal details, club, QPR cert info**

☐  **Edit permitted details (phone, preferred language)**

☐  **Change password**

☐  **Immediate save confirmation**

# **4\. Core Workflows**

## **4.1 Gatekeeper Onboarding**

☐  **Gatekeeper completes QPR training (offline)**

☐  **Champion adds Gatekeeper with details \+ QPR date**

☐  **System auto-generates mobile login credentials**

☐  **(Optional) Automated email/WhatsApp notification with credentials**  —  may be deferred

☐  **Gatekeeper downloads app & logs in**

## **4.2 Bulk Gatekeeper Data Import**

☐  **CSV / Excel upload support**

☐  **Template fields: Name, Email, Phone, Club, QPR Date**

☐  **Validation with flagged missing/invalid rows**

☐  **Preview before confirming import**

☐  **Post-import summary (success / errors / duplicates)**

☐  **Downloadable import template**

# **5\. Language Support**

☐  **English — full support (Web \+ Mobile)**

☐  **Sinhala/Tamil — Mobile App (priority)**

☐  **Sinhala/Tamil — Web App for Champions**  —  timeline-dependent

☐  **Language selection on first login \+ change later in settings**

☐  **Announcements creatable in one or both languages**

# **6\. Recommended Additional Features (Not Explicitly Requested)**

*These were not part of the original scope but are suggested for platform success. Confirm with stakeholders before committing development time.*

☐  **Push notifications (mobile)**  —  Recommended

☐  **Mood tracker for Gatekeepers**  —  Recommended — if time allows

☐  **Event registration / attendance tracking**  —  Recommended

☐  **Announcement read tracking**  —  Recommended

☐  **Audit log of admin activity**  —  Recommended

# **7\. Non-Functional Requirements**

☐  **HTTPS for all data in transit**

☐  **Secure password hashing**

☐  **Strict RBAC enforcement**

☐  **Web pages load within 3 seconds**

☐  **Mobile app performs well on mid-range phones**

☐  **Architecture supports future scale (users, resources, events)**

☐  **99% uptime target during business hours**

☐  **Advance notice for scheduled maintenance**

☐  **Clean, intuitive UI requiring minimal training**

☐  **Automated daily backups, 30-day retention**

☐  **Data protection compliance; Gatekeepers informed of data use**

☐  **Web: Chrome, Firefox, Safari, Edge (modern versions)**

☐  **Mobile: iOS 14+ and Android 9+**

# **8\. Out of Scope — Phase 1**

*Explicitly excluded from Phase 1; deferred to future phases.*

☐  **Participant mobile app features**

☐  **Therapist / psychologist connect platform**

☐  **Advanced analytics & reporting**

☐  **In-app messaging / chat**

☐  **Payment gateway**

☐  **Participant registration**