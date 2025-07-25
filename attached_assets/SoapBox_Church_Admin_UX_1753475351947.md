# Church & Group Admin UX Flow – SoapBox Super App

**Last Updated:** July 25, 2025

## 🧭 Overview
This document outlines the proposed user experience (UX) structure and implementation instructions for church and group administration inside the SoapBox Super App. The purpose is to streamline onboarding, enhance clarity, and enable scale for both churches and future non-church organizations (e.g., PTA, AA).

---

## 1. Onboarding Flow

### ✅ New User Onboarding
- Ask upon signup: _“Are you a general member or a Church/Group Administrator?”_
- If **Administrator**, direct them to either:
  - **Claim an existing church or group**
  - **Create a new one**

---

## 2. Church / Group Claim vs. Creation

### ➕ Create Church / Group
- Move the “Add Church” form to a new `Churches / Groups` tab
- Required Fields:
  - Organization Name
  - Address
  - Type (Church / Group)
  - Denomination or Affiliation
  - Admin Contact (email, phone)
  - Optional: Upload logo

### 🔍 Claim Existing Church
- Searchable list of known churches
- If unclaimed, allow admins to apply
- Verification: Email domain match or manual approval

---

## 3. Church / Group Setup Wizard

After creation/claim, prompt the following:

### Step 1: Add Staff Roles
- Roles: Pastor, Ministry Leader, Social Media Director, Volunteer Coordinator
- Add via: Name + Email → Invite

### Step 2: Add Campuses
- Identify 1 as “Main Campus”
- Label others as “Satellite Campuses”

### Step 3: Add Ministries
- Allow church-specific ministries (e.g. Youth, Worship, Prayer)

### Step 4: Invite Members
- Generate invite links
- Allow approval workflows

---

## 4. Navigation Tab Structure

| Tab                    | Purpose                                           |
|------------------------|---------------------------------------------------|
| **Dashboard**          | Overview, stats, quick actions                    |
| **Churches / Groups**  | Claim, create, and view organizations             |
| **Church Management**  | Add/edit campuses, ministries, staff              |
| **Member Directory**   | Manage invitations, approvals, roles              |
| **Analytics**          | Track engagement, transfers, activity             |

---

## 5. Replit Implementation Instructions

### ✅ MUST DO:
- [ ] Move “Add Church” and “Claim Church” actions to new tab: **Churches / Groups**
- [ ] Implement Admin onboarding flow with role selection
- [ ] Build the post-creation wizard: Staff → Campuses → Ministries → Members
- [ ] Allow users to request to **claim** existing churches with approval workflow
- [ ] Support expansion to non-church groups by using general terms like **Group** in schema
- [ ] Keep member invites and staff management in `Church Management` tab
- [ ] Add UI labels: “Main Campus”, “Satellite Campus”

### 🚀 Optional Enhancements:
- [ ] Role-based permission templates
- [ ] AI ministry suggestions based on church size/type
- [ ] Member activity/discipleship tracking

---

## 🔒 Notes
- Consider using role-based access control (RBAC) for staff vs. admin vs. volunteer permissions.
- Future roadmap may include:
  - Campus-specific event management
  - Moderation queue
  - Private vs public groups

---

**Prepared for implementation by Replit dev team.**  
For any clarifications, contact: SoapBox Core PM
