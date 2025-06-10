# Church Admin Dashboard Testing Guide

## Prerequisites
✅ User account with admin role set up
✅ Church assignment completed
✅ Application running on port 5000

## Testing Steps

### 1. Access Admin Dashboard
- Navigate to: `http://localhost:5000/admin`
- Should see comprehensive admin dashboard with multiple tabs

### 2. Member Analytics Tab
**What to test:**
- Total member count display
- Active members (last 30 days)
- New members this month
- Member engagement metrics

**Expected behavior:**
- Charts and statistics load properly
- Data reflects actual church membership
- Engagement percentages display correctly

### 3. Communication Campaigns Tab
**Test creating a new campaign:**
```
Campaign Name: "Weekly Newsletter"
Type: Email
Target Audience: All Members
Message: "Stay connected with our weekly updates!"
Schedule: Next Sunday 9:00 AM
```

**Expected behavior:**
- Form submission creates new campaign
- Campaign appears in campaigns list
- Status updates correctly

### 4. Volunteer Management Tab
**Test creating volunteer roles:**
```
Role Name: "Sunday School Teacher"
Description: "Teach children ages 5-12"
Requirements: "Background check required"
Time Commitment: "2 hours/week"
```

**Expected behavior:**
- New role creates successfully
- Appears in volunteer roles list
- Can be edited or deactivated

### 5. Donation Tracking Tab
**Features to verify:**
- Total donations summary
- Monthly donation trends
- Donor statistics
- Donation categories management

**Test creating donation category:**
```
Category: "Building Fund"
Description: "Contributions for facility improvements"
Goal Amount: $50,000
```

### 6. Campus Management Tab
**Test adding a new campus:**
```
Campus Name: "Downtown Campus"
Address: "123 Main Street, City, State"
Contact: "campus@church.org"
Phone: "555-0123"
Primary Campus: No
```

### 7. Spiritual Growth Tracking Tab
**Features to test:**
- Member spiritual milestones
- Growth category filters
- Achievement tracking
- Progress reports

## API Endpoints to Test

### Analytics Endpoints
```bash
GET /api/admin/analytics
GET /api/admin/analytics/engagement
```

### Communication Endpoints
```bash
GET /api/admin/campaigns
POST /api/admin/campaigns
```

### Volunteer Endpoints
```bash
GET /api/admin/volunteer-roles
POST /api/admin/volunteer-roles
```

### Donation Endpoints
```bash
GET /api/admin/donations/summary
GET /api/admin/donations
GET /api/admin/donations/categories
POST /api/admin/donations/categories
```

### Campus Endpoints
```bash
GET /api/admin/campuses
POST /api/admin/campuses
```

## Testing with Browser Developer Tools

1. **Network Tab:**
   - Monitor API calls when switching tabs
   - Verify 200 status codes for successful requests
   - Check response data structure

2. **Console Tab:**
   - Look for any JavaScript errors
   - Verify React component rendering

3. **Application Tab:**
   - Check localStorage for user session
   - Verify authentication state

## Expected Dashboard Features

### Overview Cards
- Total Members count
- Active Members (30 days)
- Monthly Growth percentage
- Engagement Score

### Charts and Visualizations
- Member growth over time
- Donation trends
- Volunteer participation
- Event attendance

### Interactive Forms
- Campaign creation with rich text editor
- Volunteer role management
- Campus configuration
- Category management

### Data Tables
- Sortable member lists
- Filterable donation records
- Searchable volunteer database
- Campaign history with status

## Troubleshooting Common Issues

### Authentication Issues
- Ensure user is logged in
- Verify admin role assignment
- Check church association

### Data Loading Issues
- Check network connectivity
- Verify API endpoints are responding
- Review browser console for errors

### Form Submission Issues
- Validate required fields
- Check for proper data formatting
- Verify server-side validation

## Performance Testing

### Load Testing
- Navigate quickly between tabs
- Submit multiple forms
- Test with large datasets

### Responsiveness Testing
- Test on different screen sizes
- Verify mobile compatibility
- Check tablet layout

## Security Testing

### Role-Based Access
- Verify only admins can access dashboard
- Test unauthorized access attempts
- Validate data filtering by church

### Data Protection
- Check that church data is isolated
- Verify user permissions
- Test input sanitization