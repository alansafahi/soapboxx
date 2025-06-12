import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  ArrowDown,
  ArrowUp,
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  SkipForward
} from "lucide-react";
import { useLocation } from "wouter";

interface TourStep {
  id: string;
  title: string;
  description: string;
  page: string; // The page to navigate to
  selector?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  content: string; // Detailed explanation
  tips?: string[]; // Key tips to highlight
  nextAction?: string; // What happens next
}

interface InteractiveTourConfig {
  role: string;
  displayName: string;
  welcomeMessage: string;
  steps: TourStep[];
  color: string;
}

const tourConfigs: InteractiveTourConfig[] = [
  // Platform Administrator Roles
  {
    role: "soapbox_owner",
    displayName: "SoapBox Owner",
    welcomeMessage: "Welcome to your platform governance center. You have ultimate authority over all policies, security, and platform operations.",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    steps: [
      {
        id: "platform_overview",
        title: "Platform Governance Dashboard",
        description: "Your command center for global platform oversight",
        page: "/admin/dashboard",
        position: "center",
        content: "As SoapBox Owner, you control all platform policies, user roles, security governance, and audits. This dashboard provides real-time insights into platform health, user engagement, and system performance across all churches.",
        tips: [
          "Monitor global user growth and church engagement",
          "Review security audit logs and compliance reports",
          "Manage feature flags and platform-wide settings",
          "Override any restrictions across the entire system"
        ],
        nextAction: "Let's explore user and role management capabilities"
      },
      {
        id: "user_management",
        title: "Global User & Role Management",
        description: "Complete authority over all platform users and roles",
        page: "/admin/users",
        position: "center",
        content: "Control every aspect of user management across all churches. Create custom roles, assign System Admins, manage Support Agents, and oversee all church administrators from this central hub.",
        tips: [
          "Grant or revoke System Admin and Support Agent roles",
          "Create custom platform-wide roles with specific permissions",
          "View comprehensive user activity and audit trails",
          "Manage multi-church administrators and regional oversight"
        ],
        nextAction: "Next we'll review global analytics and reporting"
      },
      {
        id: "analytics",
        title: "Global Analytics & Financial Oversight",
        description: "Platform-wide metrics and financial authority",
        page: "/admin/analytics",
        position: "center",
        content: "Access comprehensive analytics spanning all churches, users, and financial transactions. Export data for business intelligence, monitor revenue streams, and track platform growth metrics.",
        tips: [
          "View cross-church analytics and engagement patterns",
          "Monitor all financial transactions and donation flows",
          "Export data for offline analysis and reporting",
          "Track feature usage and subscription tier performance"
        ],
        nextAction: "Let's explore security and compliance features"
      },
      {
        id: "security",
        title: "Security & Compliance Center",
        description: "Platform security governance and audit controls",
        page: "/admin/security",
        position: "center",
        content: "Enforce security policies, review audit logs, and manage compliance requirements across the entire platform. Configure global security settings and monitor potential threats.",
        tips: [
          "Set platform-wide security policies and requirements",
          "Review comprehensive audit trails for all admin actions",
          "Manage GDPR/CCPA compliance and data protection",
          "Configure content moderation and abuse prevention"
        ],
        nextAction: "Finally, let's review system configuration options"
      },
      {
        id: "system_config",
        title: "System Configuration & Infrastructure",
        description: "Core platform settings and infrastructure management",
        page: "/admin/system",
        position: "center",
        content: "Configure global feature flags, manage API integrations, control system-wide settings, and coordinate with development teams on platform updates and maintenance.",
        tips: [
          "Enable/disable features across all churches",
          "Manage API keys and third-party integrations",
          "Control mobile app versions and feature rollouts",
          "Send platform-wide notifications and announcements"
        ],
        nextAction: "You now have complete platform governance capabilities"
      }
    ]
  },
  {
    role: "system_admin",
    displayName: "System Admin",
    welcomeMessage: "Access your comprehensive system administration tools for managing all churches, users, and platform operations.",
    color: "bg-red-100 text-red-800 border-red-200",
    steps: [
      {
        id: "admin_dashboard",
        title: "System Administration Hub",
        description: "Central control for platform-wide administration",
        page: "/admin/dashboard",
        position: "center",
        content: "Your system administration dashboard provides full oversight of all churches, users, billing, and platform operations. Monitor system health, manage support tickets, and ensure smooth operations across the entire platform.",
        tips: [
          "View all churches and their activity status",
          "Monitor user engagement and growth metrics",
          "Access comprehensive billing and subscription data",
          "Review system health and performance indicators"
        ],
        nextAction: "Let's explore church and user management tools"
      },
      {
        id: "church_management",
        title: "Church & User Administration",
        description: "Comprehensive management of all platform entities",
        page: "/admin/churches",
        position: "center",
        content: "Manage all churches on the platform including creation, suspension, and deletion. Assign Church Admins, manage user roles, and ensure compliance with platform policies.",
        tips: [
          "Create, suspend, or archive church instances",
          "Promote/demote Super Admins and Church Admins",
          "Verify new churches and denominations",
          "Impersonate users for support purposes with full audit logging"
        ],
        nextAction: "Now let's review moderation and security tools"
      },
      {
        id: "moderation",
        title: "Content Moderation & Security",
        description: "Platform-wide content and security oversight",
        page: "/admin/moderation",
        position: "center",
        content: "Monitor and moderate content across all churches. Handle abuse reports, enforce community guidelines, and maintain platform security through comprehensive monitoring tools.",
        tips: [
          "Review flagged content and abuse reports",
          "Configure global content moderation policies",
          "Access audit logs for all administrative actions",
          "Manage security settings and user restrictions"
        ],
        nextAction: "Let's examine billing and financial oversight capabilities"
      },
      {
        id: "billing",
        title: "Billing & Financial Management",
        description: "Platform-wide financial oversight and management",
        page: "/admin/billing",
        position: "center",
        content: "Oversee all financial transactions, manage subscription tiers, handle billing disputes, and monitor revenue across the platform. Full access to Stripe Connect and payment processing.",
        tips: [
          "View all transaction flows and payment processing",
          "Adjust pricing tiers and subscription plans",
          "Issue refunds, credits, and billing overrides",
          "Monitor church financial activity and donation flows"
        ],
        nextAction: "Finally, let's explore support and ticket management"
      },
      {
        id: "support",
        title: "Support & Ticket Management",
        description: "Platform-wide support operations and user assistance",
        page: "/admin/support",
        position: "center",
        content: "Manage support tickets across all churches, assist users with technical issues, and coordinate with Support Agents. Access tools for user impersonation and issue resolution.",
        tips: [
          "View and manage all platform support tickets",
          "Coordinate with Support Agents and escalate issues",
          "Access user impersonation tools for troubleshooting",
          "Generate support reports and track resolution metrics"
        ],
        nextAction: "You now have full system administration capabilities"
      }
    ]
  },
  {
    role: "support_agent",
    displayName: "Support Agent",
    welcomeMessage: "Welcome to your support center. Help users resolve issues, manage tickets, and ensure excellent customer service across all churches.",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    steps: [
      {
        id: "support_dashboard",
        title: "Support Operations Dashboard",
        description: "Your central hub for helping users and managing tickets",
        page: "/support/dashboard",
        position: "center",
        content: "Monitor active support tickets, track resolution times, and access tools to help users across all churches. Your role is essential for maintaining high user satisfaction and platform quality.",
        tips: [
          "Prioritize tickets by urgency and church size",
          "Use quick-response templates for common issues",
          "Escalate complex technical issues to System Admins",
          "Track your performance metrics and response times"
        ],
        nextAction: "Let's explore ticket management and user assistance tools"
      },
      {
        id: "ticket_management",
        title: "Ticket Management & Resolution",
        description: "Handle user issues efficiently and effectively",
        page: "/support/tickets",
        position: "center",
        content: "Manage support tickets with priority queuing, automated routing, and comprehensive user context. Access user accounts safely to troubleshoot issues and provide immediate assistance.",
        tips: [
          "View complete user history and church context",
          "Use screen sharing tools for complex issues",
          "Document solutions for knowledge base updates",
          "Coordinate with Church Admins for church-specific problems"
        ],
        nextAction: "Now let's review user assistance and communication tools"
      },
      {
        id: "user_assistance",
        title: "User Assistance & Communication",
        description: "Direct communication tools for helping users",
        page: "/support/assistance",
        position: "center",
        content: "Communicate with users through multiple channels including in-app messaging, email, and phone support. Access guided tutorials and help documentation to resolve issues quickly.",
        tips: [
          "Use empathetic communication for frustrated users",
          "Provide step-by-step guidance with screenshots",
          "Offer training sessions for church leadership",
          "Create custom help content for recurring issues"
        ],
        nextAction: "Finally, let's explore knowledge base and training resources"
      },
      {
        id: "knowledge_base",
        title: "Knowledge Base & Training",
        description: "Resources for continuous learning and issue resolution",
        page: "/support/knowledge",
        position: "center",
        content: "Access comprehensive documentation, training materials, and best practices for resolving user issues. Contribute to the knowledge base by documenting new solutions and common problems.",
        tips: [
          "Search solutions by keyword, church size, or issue type",
          "Update documentation when new features are released",
          "Share successful resolution strategies with the team",
          "Participate in regular training sessions and updates"
        ],
        nextAction: "You're ready to provide excellent support to all users"
      }
    ]
  },
  // Church Administrator Roles
  {
    role: "platform_admin",
    displayName: "Platform Admin",
    welcomeMessage: "Welcome to your platform administration center. Manage church operations, oversee staff, and ensure smooth platform functionality.",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    steps: [
      {
        id: "admin_overview",
        title: "Platform Administration Overview",
        description: "Your central hub for church and platform management",
        page: "/admin/dashboard",
        position: "center",
        content: "As a Platform Admin, you bridge the gap between platform oversight and church operations. Monitor multiple churches, assist with onboarding, and ensure best practices across your assigned churches.",
        tips: [
          "Monitor church health and engagement metrics",
          "Assist new churches with setup and onboarding",
          "Coordinate between platform updates and church needs",
          "Provide guidance on best practices and feature usage"
        ],
        nextAction: "Let's explore church oversight and management tools"
      },
      {
        id: "church_oversight",
        title: "Church Oversight & Support",
        description: "Tools for managing and supporting multiple churches",
        page: "/admin/churches",
        position: "center",
        content: "Oversee church operations, assist with administrative tasks, and ensure churches are maximizing their platform usage. Provide training and support to Church Admins and staff members.",
        tips: [
          "Review church activity and identify growth opportunities",
          "Help churches configure features and optimize settings",
          "Coordinate training sessions for church staff",
          "Monitor compliance with platform policies"
        ],
        nextAction: "Now let's review user management and role administration"
      },
      {
        id: "user_management_admin",
        title: "User & Role Management",
        description: "Administrative tools for managing users across churches",
        page: "/admin/users",
        position: "center",
        content: "Manage user roles, permissions, and access levels across your assigned churches. Help resolve user issues and ensure proper role assignments for optimal church operations.",
        tips: [
          "Assign and modify user roles as needed",
          "Resolve user access and permission issues",
          "Coordinate with church leadership on role changes",
          "Monitor user engagement and provide usage guidance"
        ],
        nextAction: "Let's explore reporting and analytics capabilities"
      },
      {
        id: "reporting_analytics",
        title: "Reporting & Analytics",
        description: "Data insights and performance monitoring tools",
        page: "/admin/analytics",
        position: "center",
        content: "Access comprehensive analytics and reporting tools to track church performance, user engagement, and platform usage. Generate reports for stakeholders and identify improvement opportunities.",
        tips: [
          "Generate custom reports for church leadership",
          "Track engagement trends and feature adoption",
          "Identify churches needing additional support",
          "Monitor financial health and donation patterns"
        ],
        nextAction: "You now have complete platform administration capabilities"
      }
    ]
  },
  {
    role: "church_admin",
    displayName: "Church Admin",
    welcomeMessage: "Welcome to your church administration center. Manage your congregation, oversee events, and build a thriving spiritual community.",
    color: "bg-green-100 text-green-800 border-green-200",
    steps: [
      {
        id: "church_dashboard",
        title: "Church Administration Dashboard",
        description: "Your command center for church management",
        page: "/dashboard",
        position: "center",
        content: "Monitor your church's activity, track member engagement, and oversee all aspects of your congregation's digital life. This dashboard provides real-time insights into member participation, events, and community health.",
        tips: [
          "Monitor member check-ins and engagement trends",
          "Track upcoming events and volunteer needs",
          "Review prayer requests and community interactions",
          "Oversee financial health and donation patterns"
        ],
        nextAction: "Let's explore member and volunteer management"
      },
      {
        id: "member_management",
        title: "Member & Volunteer Management",
        description: "Tools for building and nurturing your congregation",
        page: "/members",
        position: "center",
        content: "Manage your church members, assign roles, and coordinate volunteer activities. Create meaningful connections within your congregation and ensure everyone feels welcomed and valued.",
        tips: [
          "Assign Staff and Volunteer roles to members",
          "Track member participation and engagement",
          "Organize small groups and ministry teams",
          "Monitor volunteer hours and recognition programs"
        ],
        nextAction: "Now let's review event planning and management"
      },
      {
        id: "event_management",
        title: "Event Planning & Management",
        description: "Comprehensive tools for organizing church activities",
        page: "/events",
        position: "center",
        content: "Plan, promote, and manage all church events from Sunday services to special celebrations. Track attendance, coordinate volunteers, and ensure every event strengthens your community.",
        tips: [
          "Create recurring events for services and regular meetings",
          "Coordinate volunteer assignments for each event",
          "Send targeted invitations and reminders",
          "Track attendance and gather feedback after events"
        ],
        nextAction: "Let's explore communication and engagement tools"
      },
      {
        id: "communication",
        title: "Communication & Engagement",
        description: "Keep your congregation connected and informed",
        page: "/communications",
        position: "center",
        content: "Send announcements, manage the prayer wall, and facilitate meaningful connections within your congregation. Use multiple channels to reach members where they are most comfortable.",
        tips: [
          "Send weekly newsletters with upcoming events",
          "Moderate prayer requests and celebration posts",
          "Create discussion groups for Bible studies",
          "Use push notifications for urgent announcements"
        ],
        nextAction: "Finally, let's review financial and donation management"
      },
      {
        id: "financial_management",
        title: "Financial & Donation Management",
        description: "Oversee church finances and stewardship",
        page: "/donations",
        position: "center",
        content: "Monitor donation patterns, manage tithes and offerings, and ensure transparent financial stewardship. Generate reports for leadership and track progress toward financial goals.",
        tips: [
          "Set up recurring donation options for members",
          "Track progress toward building fund and mission goals",
          "Generate financial reports for church board meetings",
          "Send donation receipts and thank you messages"
        ],
        nextAction: "You're ready to lead your church community effectively"
      }
    ]
  },
  // Member Roles
  {
    role: "staff",
    displayName: "Staff Member",
    welcomeMessage: "Welcome to your ministry tools. Support your church's mission through effective communication, event coordination, and member care.",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    steps: [
      {
        id: "staff_dashboard",
        title: "Ministry Dashboard",
        description: "Your hub for ministry activities and member care",
        page: "/dashboard",
        position: "center",
        content: "Access tools designed specifically for church staff to support ministry activities, communicate with members, and coordinate events. Your role is essential for building community and supporting spiritual growth.",
        tips: [
          "View your assigned ministry areas and responsibilities",
          "Monitor member engagement in your programs",
          "Access member contact information for pastoral care",
          "Track volunteer schedules and ministry participation"
        ],
        nextAction: "Let's explore member communication and care tools"
      },
      {
        id: "member_care",
        title: "Member Communication & Care",
        description: "Tools for pastoral care and member support",
        page: "/members",
        position: "center",
        content: "Communicate with congregation members, provide pastoral care, and build meaningful relationships. Access member information securely to offer personalized support and guidance.",
        tips: [
          "Send private messages for pastoral counseling",
          "Schedule appointments and care visits",
          "Access member prayer requests for personal follow-up",
          "Coordinate care teams and support groups"
        ],
        nextAction: "Now let's review event coordination capabilities"
      },
      {
        id: "event_coordination",
        title: "Event Coordination & Ministry",
        description: "Support church events and ministry programs",
        page: "/events",
        position: "center",
        content: "Help coordinate church events, manage volunteer teams, and ensure smooth operation of ministry programs. Your hands-on support makes every event successful.",
        tips: [
          "Coordinate volunteers for your ministry events",
          "Manage event logistics and setup requirements",
          "Track attendance for programs you oversee",
          "Send follow-up communications after events"
        ],
        nextAction: "Let's explore prayer ministry and spiritual support"
      },
      {
        id: "prayer_ministry",
        title: "Prayer Ministry & Spiritual Support",
        description: "Support the spiritual life of your congregation",
        page: "/prayer-wall",
        position: "center",
        content: "Engage with the prayer wall, offer spiritual support, and help facilitate meaningful prayer ministry within your congregation. Your spiritual guidance helps members grow in faith.",
        tips: [
          "Respond to prayer requests with encouragement",
          "Organize prayer groups and prayer chains",
          "Share spiritual insights and devotional content",
          "Follow up on answered prayers and celebrations"
        ],
        nextAction: "You're equipped to serve your congregation effectively"
      }
    ]
  },
  {
    role: "volunteer",
    displayName: "Volunteer",
    welcomeMessage: "Thank you for your heart to serve! Discover opportunities to make a difference in your church community and grow in your faith journey.",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    steps: [
      {
        id: "volunteer_welcome",
        title: "Your Volunteer Journey Begins",
        description: "Discover meaningful ways to serve your church community",
        page: "/volunteer-opportunities",
        position: "center",
        content: "Your willingness to serve is a blessing to your church community. Explore volunteer opportunities that match your interests, skills, and availability. Every contribution makes a difference in building God's kingdom.",
        tips: [
          "Browse opportunities by ministry area and time commitment",
          "Sign up for recurring volunteer roles or one-time events",
          "Track your volunteer hours and impact",
          "Connect with other volunteers and ministry leaders"
        ],
        nextAction: "Let's explore how to find and sign up for opportunities"
      },
      {
        id: "opportunity_discovery",
        title: "Finding Your Perfect Volunteer Match",
        description: "Discover opportunities that align with your calling",
        page: "/volunteer-opportunities",
        selector: "[data-tour='volunteer-opportunities']",
        position: "right",
        content: "Browse volunteer opportunities organized by ministry area, skill requirements, and time commitment. From children's ministry to community outreach, find where your unique gifts can make the biggest impact.",
        tips: [
          "Filter opportunities by your interests and availability",
          "Read detailed descriptions to understand requirements",
          "View upcoming volunteer events and special projects",
          "Contact ministry leaders with questions before committing"
        ],
        nextAction: "Now let's see how to manage your volunteer commitments"
      },
      {
        id: "volunteer_scheduling",
        title: "Managing Your Service Schedule",
        description: "Keep track of your volunteer commitments",
        page: "/my-volunteering",
        position: "center",
        content: "View your upcoming volunteer commitments, track your service hours, and manage your schedule. Receive reminders about upcoming opportunities and celebrate your contributions to the church community.",
        tips: [
          "Set availability preferences for automatic scheduling",
          "Receive reminders via email or push notifications",
          "Request substitutes when you can't fulfill commitments",
          "View your volunteer history and hours contributed"
        ],
        nextAction: "Let's explore community engagement and growth opportunities"
      },
      {
        id: "community_engagement",
        title: "Building Community Through Service",
        description: "Connect with others and grow in your faith",
        page: "/community",
        position: "center",
        content: "Volunteering is more than just helping—it's about building relationships and growing in faith. Connect with other volunteers, participate in community discussions, and celebrate the impact you're making together.",
        tips: [
          "Join volunteer team group chats and discussions",
          "Share prayer requests and celebrate answered prayers",
          "Participate in volunteer appreciation events",
          "Mentor new volunteers and share your experience"
        ],
        nextAction: "You're ready to make a lasting impact through service"
      }
    ]
  },
  {
    role: "member",
    displayName: "Church Member",
    welcomeMessage: "Welcome to your church community! Discover ways to connect, grow in faith, and build meaningful relationships with fellow believers.",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    steps: [
      {
        id: "member_welcome",
        title: "Welcome to Your Church Community",
        description: "Start your journey of faith and fellowship",
        page: "/dashboard",
        position: "center",
        content: "Welcome to your digital church home! Here you can stay connected with your congregation, participate in community life, and grow in your faith journey. Your church family is excited to have you here.",
        tips: [
          "Check in to services and events to stay connected",
          "Browse upcoming events and register to attend",
          "Connect with other members through small groups",
          "Access daily devotionals and spiritual growth resources"
        ],
        nextAction: "Let's explore how to stay connected with your church"
      },
      {
        id: "church_connection",
        title: "Staying Connected with Your Church",
        description: "Participate in church life and community",
        page: "/events",
        position: "center",
        content: "Discover upcoming events, services, and activities. From Sunday worship to small group meetings, stay engaged with all aspects of church life and build meaningful relationships with your church family.",
        tips: [
          "Register for events and add them to your calendar",
          "Join small groups that match your interests",
          "Volunteer for events and ministries you're passionate about",
          "Invite friends and family to special church events"
        ],
        nextAction: "Now let's explore spiritual growth and community support"
      },
      {
        id: "spiritual_growth",
        title: "Growing in Faith Together",
        description: "Access resources for spiritual development",
        page: "/daily-bible",
        position: "center",
        content: "Engage with daily Bible readings, devotionals, and spiritual growth resources. Track your progress on faith journeys and connect with others who are growing in their relationship with God.",
        tips: [
          "Read daily devotionals and Bible passages",
          "Join Bible study groups and discussion forums",
          "Track your spiritual growth milestones",
          "Share insights and prayers with the community"
        ],
        nextAction: "Let's discover how to support and be supported by your community"
      },
      {
        id: "community_support",
        title: "Prayer, Support, and Fellowship",
        description: "Give and receive support within your church family",
        page: "/prayer-wall",
        position: "center",
        content: "Participate in your church's prayer life by sharing requests, offering prayers for others, and celebrating God's faithfulness. Your church community is here to support you through all of life's seasons.",
        tips: [
          "Share prayer requests and receive support from your church family",
          "Pray for others and offer encouragement",
          "Celebrate answered prayers and life milestones",
          "Connect with pastoral care when you need additional support"
        ],
        nextAction: "You're ready to thrive in your church community"
      }
    ]
  }
        description: "Your central hub for user assistance and issue management",
        page: "/support/dashboard",
        position: "center",
        content: "Monitor support tickets, live chat requests, and user issues across all churches. Prioritize urgent matters and track your response times and resolution metrics.",
        tips: [
          "View incoming support tickets and live chat requests",
          "Categorize issues by type and urgency level",
          "Track response times and customer satisfaction",
          "Access user account information securely"
        ],
        nextAction: "Let's explore user assistance and troubleshooting tools"
      },
      {
        id: "user_assistance",
        title: "User Assistance & Account Management",
        description: "Help users with account issues and platform navigation",
        page: "/support/users",
        position: "center",
        content: "Assist users with password resets, account verification, church affiliation changes, and general platform guidance. Access tools for account management and user support.",
        tips: [
          "Securely impersonate users to reproduce issues",
          "Help with password resets and login problems",
          "Assist with church affiliation and role changes",
          "Guide users through onboarding and feature adoption"
        ],
        nextAction: "Now let's look at community moderation tools"
      },
      {
        id: "moderation",
        title: "Community Moderation",
        description: "Monitor and moderate community content and interactions",
        page: "/support/moderation",
        position: "center",
        content: "Review prayer wall posts, forum discussions, and community interactions. Flag inappropriate content, respond to spiritual support requests, and escalate pastoral care needs.",
        tips: [
          "Monitor prayer wall and community posts for guidelines violations",
          "Provide compassionate responses to spiritual support requests",
          "Flag and escalate abusive or inappropriate content",
          "Forward spiritual care needs to appropriate church leaders"
        ],
        nextAction: "Let's examine billing and subscription support capabilities"
      },
      {
        id: "billing_support",
        title: "Billing & Subscription Support",
        description: "Assist users with payment and subscription issues",
        page: "/support/billing",
        position: "center",
        content: "Help resolve payment failures, subscription changes, and billing inquiries. Apply promotional codes, adjust plans, and coordinate with finance teams for refunds.",
        tips: [
          "Resolve credit card failures and payment issues",
          "Apply promotional codes and upgrade user plans",
          "Explain subscription benefits and feature access",
          "Coordinate refunds and charge dispute resolution"
        ],
        nextAction: "Finally, let's review knowledge management and feedback collection"
      },
      {
        id: "knowledge",
        title: "Knowledge Base & Feedback Collection",
        description: "Maintain help resources and gather user insights",
        page: "/support/knowledge",
        position: "center",
        content: "Update help center articles, document common issues, and collect user feedback for product improvements. Track frequently requested features and pain points.",
        tips: [
          "Update help center articles when features change",
          "Document solutions for recurring technical problems",
          "Collect and categorize user feedback and feature requests",
          "Generate reports on support trends and user needs"
        ],
        nextAction: "You're ready to provide excellent platform-wide support!"
      }
    ]
  },
  {
    role: "member",
    displayName: "Church Member",
    welcomeMessage: "Let's explore how to connect, grow, and engage in your faith journey!",
    color: "bg-green-100 text-green-800 border-green-200",
    steps: [
      {
        id: "welcome",
        title: "Welcome to SoapBox",
        description: "Your spiritual community hub",
        page: "/",
        position: "center",
        content: "Welcome! SoapBox connects you with your church community, helps you grow spiritually, and keeps you engaged with what matters most in your faith journey.",
        tips: [
          "Access everything from one central dashboard",
          "Stay connected with your church family",
          "Track your spiritual growth progress"
        ]
      },
      {
        id: "find_churches",
        title: "Discover Churches",
        description: "Find a spiritual home that fits your beliefs",
        page: "/churches",
        selector: ".church-card",
        position: "right",
        content: "Browse churches in your area and find one that aligns with your faith tradition. Each church profile shows their denomination, location, and community focus.",
        tips: [
          "Filter by denomination and location",
          "Read about each church's mission",
          "See upcoming events and services"
        ],
        nextAction: "We'll show you daily Bible reading next"
      },
      {
        id: "daily_bible",
        title: "Daily Bible Reading",
        description: "Build consistent scripture habits",
        page: "/bible",
        selector: ".reading-plan",
        position: "left",
        content: "Start your day with guided Bible reading. Choose from various reading plans, track your progress, and reflect on daily verses.",
        tips: [
          "Multiple reading plans available",
          "Track your reading streaks",
          "Share insights with your community"
        ],
        nextAction: "Let's explore the prayer wall"
      },
      {
        id: "prayer_wall",
        title: "Community Prayer",
        description: "Share prayer requests and support others",
        page: "/prayer",
        selector: ".prayer-request",
        position: "top",
        content: "Join your community in prayer by sharing requests and supporting others. This is where faith becomes fellowship.",
        tips: [
          "Share your prayer needs anonymously if preferred",
          "Pray for others and offer encouragement",
          "See answered prayers and testimonies"
        ],
        nextAction: "Finally, let's check your spiritual progress"
      },
      {
        id: "spiritual_progress",
        title: "Track Your Growth",
        description: "See your faith journey milestones",
        page: "/leaderboard",
        selector: ".achievement-badge",
        position: "bottom",
        content: "Celebrate your spiritual milestones! Earn badges for reading consistency, prayer participation, and community engagement.",
        tips: [
          "Earn badges for various spiritual activities",
          "See your reading streaks and participation",
          "Connect with other growing believers"
        ]
      }
    ]
  },
  {
    role: "volunteer",
    displayName: "Volunteer",
    welcomeMessage: "Discover how to serve and make an impact in your church community!",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    steps: [
      {
        id: "volunteer_welcome",
        title: "Volunteer Dashboard",
        description: "Your service hub",
        page: "/",
        position: "center",
        content: "As a volunteer, you're the heart of church ministry! This dashboard shows your upcoming service opportunities and impact metrics.",
        tips: [
          "View your upcoming volunteer commitments",
          "See the impact of your service",
          "Connect with other volunteers"
        ]
      },
      {
        id: "volunteer_events",
        title: "Service Opportunities",
        description: "Find ways to serve and help",
        page: "/events",
        selector: ".volunteer-opportunity",
        position: "right",
        content: "Browse upcoming events where volunteers are needed. From children's ministry to community outreach, find where your gifts can shine.",
        tips: [
          "Sign up for events that match your skills",
          "See time commitments and requirements",
          "Connect with ministry leaders"
        ],
        nextAction: "Let's see how to connect with your team"
      },
      {
        id: "volunteer_messages",
        title: "Team Communication",
        description: "Stay connected with ministry teams",
        page: "/messages",
        selector: ".ministry-chat",
        position: "left",
        content: "Communicate with your ministry teams, get updates about service opportunities, and coordinate with other volunteers.",
        tips: [
          "Direct messaging with ministry leaders",
          "Group chats for team coordination",
          "Important announcements and updates"
        ]
      }
    ]
  },
  {
    role: "youth_leader",
    displayName: "Youth Leader",
    welcomeMessage: "Learn how to engage and mentor the next generation!",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    steps: [
      {
        id: "youth_dashboard",
        title: "Youth Ministry Hub",
        description: "Your central command for youth engagement",
        page: "/",
        position: "center",
        content: "Welcome to your youth ministry dashboard! Here you can track youth engagement, plan events, and connect with families.",
        tips: [
          "Monitor youth participation and growth",
          "Coordinate with parents and volunteers",
          "Plan age-appropriate activities and events"
        ]
      },
      {
        id: "youth_events",
        title: "Youth Events & Activities",
        description: "Create engaging experiences for young people",
        page: "/events",
        selector: ".youth-event",
        position: "right",
        content: "Plan and manage youth-specific events from Bible studies to community service projects. Create experiences that build faith and community.",
        tips: [
          "Age-appropriate content and activities",
          "Track attendance and engagement",
          "Coordinate with parent volunteers"
        ],
        nextAction: "Let's see how to communicate with youth and families"
      },
      {
        id: "youth_communication",
        title: "Family Communication",
        description: "Stay connected with youth and their families",
        page: "/messages",
        selector: ".family-chat",
        position: "left",
        content: "Maintain healthy communication with youth participants and their families. Share updates, coordinate activities, and provide pastoral care.",
        tips: [
          "Direct messaging with appropriate oversight",
          "Group communications for events",
          "Parent notifications and updates"
        ]
      }
    ]
  },
  {
    role: "ministry_leader",
    displayName: "Ministry Leader",
    welcomeMessage: "Discover tools to lead and grow your ministry effectively!",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    steps: [
      {
        id: "ministry_overview",
        title: "Ministry Dashboard",
        description: "Comprehensive ministry management",
        page: "/",
        position: "center",
        content: "Your ministry leadership hub provides insights into participation, volunteer coordination, and ministry impact metrics.",
        tips: [
          "Track ministry participation and growth",
          "Coordinate volunteers and resources",
          "Monitor ministry health and effectiveness"
        ]
      },
      {
        id: "volunteer_management",
        title: "Volunteer Coordination",
        description: "Recruit and manage your ministry team",
        page: "/events",
        selector: ".volunteer-section",
        position: "right",
        content: "Recruit, train, and schedule volunteers for your ministry. Match people's gifts with service opportunities.",
        tips: [
          "Volunteer recruitment and onboarding",
          "Skill-based ministry matching",
          "Training and development tracking"
        ],
        nextAction: "Now let's explore ministry communication tools"
      },
      {
        id: "ministry_communication",
        title: "Ministry Communication",
        description: "Keep your team informed and connected",
        page: "/messages",
        selector: ".ministry-updates",
        position: "left",
        content: "Communicate effectively with your ministry team, share announcements, and coordinate activities.",
        tips: [
          "Team-wide announcements and updates",
          "Private coordination with leadership",
          "Resource sharing and planning"
        ]
      }
    ]
  },
  {
    role: "lead_pastor",
    displayName: "Lead Pastor",
    welcomeMessage: "Access tools for pastoral care and church leadership!",
    color: "bg-red-100 text-red-800 border-red-200",
    steps: [
      {
        id: "pastoral_dashboard",
        title: "Pastoral Leadership Center",
        description: "Church-wide oversight and care",
        page: "/",
        position: "center",
        content: "Your pastoral dashboard provides a comprehensive view of church health, member care needs, and leadership priorities.",
        tips: [
          "Church-wide health and growth metrics",
          "Member care and pastoral needs",
          "Leadership coordination and oversight"
        ]
      },
      {
        id: "member_care",
        title: "Pastoral Care & Counseling",
        description: "Provide spiritual guidance and support",
        page: "/messages",
        selector: ".pastoral-care",
        position: "right",
        content: "Manage pastoral care requests, schedule counseling sessions, and provide spiritual guidance to church members.",
        tips: [
          "Confidential pastoral care communications",
          "Counseling session scheduling",
          "Crisis intervention and support"
        ],
        nextAction: "Let's see the prayer ministry tools"
      },
      {
        id: "prayer_ministry",
        title: "Prayer Ministry Oversight",
        description: "Lead the church in prayer and intercession",
        page: "/prayer",
        selector: ".pastoral-prayer",
        position: "left",
        content: "Oversee the church's prayer ministry, respond to urgent prayer needs, and lead corporate prayer initiatives.",
        tips: [
          "Review and respond to prayer requests",
          "Coordinate prayer teams and initiatives",
          "Lead corporate prayer events"
        ]
      }
    ]
  },
  {
    role: "social_manager",
    displayName: "Social Manager",
    welcomeMessage: "Learn to build community and enhance church communications!",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    steps: [
      {
        id: "community_dashboard",
        title: "Community Engagement Hub",
        description: "Foster connections and communication",
        page: "/",
        position: "center",
        content: "Your social management dashboard helps you build community, moderate discussions, and enhance church communications.",
        tips: [
          "Monitor community engagement and health",
          "Facilitate meaningful connections",
          "Coordinate social events and activities"
        ]
      },
      {
        id: "community_building",
        title: "Community Discussions",
        description: "Facilitate meaningful conversations",
        page: "/community",
        selector: ".discussion-thread",
        position: "right",
        content: "Moderate and facilitate community discussions, help members connect, and foster a healthy online church environment.",
        tips: [
          "Moderate discussions with wisdom",
          "Facilitate introductions and connections",
          "Create engaging conversation starters"
        ],
        nextAction: "Next, we'll explore communication tools"
      },
      {
        id: "social_communication",
        title: "Church Communications",
        description: "Manage announcements and updates",
        page: "/messages",
        selector: ".church-announcements",
        position: "left",
        content: "Coordinate church-wide communications, manage announcements, and ensure important information reaches the congregation.",
        tips: [
          "Church-wide announcements and news",
          "Event promotion and coordination",
          "Member directory and connections"
        ]
      }
    ]
  },
  {
    role: "church_admin",
    displayName: "Church Admin",
    welcomeMessage: "Master the administrative tools that keep the church running smoothly!",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    steps: [
      {
        id: "admin_dashboard",
        title: "Administrative Control Center",
        description: "Church operations and management",
        page: "/admin",
        position: "center",
        content: "Your administrative dashboard provides comprehensive church management tools, member oversight, and operational controls.",
        tips: [
          "Complete church membership management",
          "Role and permission administration",
          "Church settings and configuration"
        ]
      },
      {
        id: "member_management",
        title: "Member Administration",
        description: "Manage church membership and roles",
        page: "/admin",
        selector: ".member-admin",
        position: "right",
        content: "Administer church membership, assign roles and permissions, and manage user access throughout the system.",
        tips: [
          "Add, edit, and manage member profiles",
          "Assign roles and permissions",
          "Track member engagement and participation"
        ],
        nextAction: "Let's explore church settings and configuration"
      },
      {
        id: "church_settings",
        title: "Church Configuration",
        description: "Configure church settings and preferences",
        page: "/admin",
        selector: ".church-settings",
        position: "left",
        content: "Configure church-wide settings, manage preferences, and customize the platform for your congregation's needs.",
        tips: [
          "Church profile and branding settings",
          "Communication and notification preferences",
          "Platform customization and features"
        ]
      }
    ]
  },
  {
    role: "church_owner",
    displayName: "Church Owner",
    welcomeMessage: "Welcome to complete church ownership and administration!",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    steps: [
      {
        id: "owner_dashboard",
        title: "Church Ownership Dashboard",
        description: "Complete church control and oversight",
        page: "/admin",
        position: "center",
        content: "As church owner, you have complete control over all church operations, staff management, and strategic oversight.",
        tips: [
          "Full administrative access and control",
          "Staff and leadership management",
          "Strategic oversight and reporting"
        ]
      },
      {
        id: "staff_management",
        title: "Staff & Leadership",
        description: "Manage church staff and leadership team",
        page: "/admin",
        selector: ".staff-management",
        position: "right",
        content: "Oversee your entire church staff, assign leadership roles, and manage organizational structure.",
        tips: [
          "Hire and manage church staff",
          "Define leadership hierarchy",
          "Performance oversight and development"
        ],
        nextAction: "Finally, let's explore strategic planning tools"
      },
      {
        id: "strategic_oversight",
        title: "Strategic Planning",
        description: "Church growth and strategic direction",
        page: "/admin",
        selector: ".strategic-planning",
        position: "left",
        content: "Access strategic planning tools, church growth analytics, and long-term visioning capabilities.",
        tips: [
          "Church growth and analytics",
          "Strategic planning and visioning",
          "Multi-campus and expansion planning"
        ]
      }
    ]
  },
  {
    role: "member",
    displayName: "Church Member",
    welcomeMessage: "Welcome to your spiritual home! Discover all the ways you can connect, grow, and serve.",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    steps: [
      {
        id: "member_dashboard",
        title: "Your Spiritual Dashboard",
        description: "Your personal church community hub",
        page: "/",
        position: "center",
        content: "Welcome to your personal church dashboard! Here you can see upcoming events, prayer requests, daily devotionals, and connect with your church family.",
        tips: [
          "Check in daily for spiritual growth",
          "View upcoming church events and activities",
          "Access daily devotionals and Bible reading",
          "Connect with other church members"
        ],
        nextAction: "Let's explore community connections"
      },
      {
        id: "community_connection",
        title: "Connect with Your Church Family",
        description: "Build meaningful relationships",
        page: "/community",
        selector: ".member-directory",
        position: "right",
        content: "Connect with other church members, join small groups, and build meaningful relationships within your church family.",
        tips: [
          "Browse member directory and profiles",
          "Join small groups and Bible studies",
          "Send encouragement and prayer requests"
        ],
        nextAction: "Now let's look at spiritual growth tools"
      },
      {
        id: "spiritual_growth",
        title: "Your Spiritual Growth Journey",
        description: "Daily devotionals and Bible study",
        page: "/bible",
        selector: ".daily-devotional",
        position: "left",
        content: "Access daily devotionals, Bible reading plans, and track your spiritual growth journey with personalized content.",
        tips: [
          "Daily Bible reading and devotionals",
          "Track your spiritual milestones",
          "Join Bible study groups"
        ]
      }
    ]
  },
  {
    role: "new_member",
    displayName: "New Member",
    welcomeMessage: "Welcome to our church family! Let us help you get started on your journey with us.",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    steps: [
      {
        id: "welcome_tour",
        title: "Welcome to Your New Church Home!",
        description: "Getting started in your church community",
        page: "/",
        position: "center",
        content: "Welcome! We're so excited you've joined our church family. This tour will help you discover all the ways you can connect, grow, and get involved.",
        tips: [
          "Complete your member profile",
          "Explore upcoming newcomer events",
          "Connect with our welcome team",
          "Discover ways to get involved"
        ],
        nextAction: "Let's set up your profile and preferences"
      },
      {
        id: "profile_setup",
        title: "Create Your Member Profile",
        description: "Tell us about yourself",
        page: "/profile",
        selector: ".profile-setup",
        position: "right",
        content: "Complete your member profile to help others get to know you and find the best ways for you to connect and serve.",
        tips: [
          "Add your interests and background",
          "Set your communication preferences",
          "Upload a profile photo",
          "Share your skills and talents"
        ],
        nextAction: "Now let's explore ways to get involved"
      },
      {
        id: "getting_involved",
        title: "Find Your Place to Serve",
        description: "Discover ministry opportunities",
        page: "/volunteer",
        selector: ".ministry-opportunities",
        position: "left",
        content: "Explore the many ways you can serve and get involved in our church community. Find ministries that match your interests and gifts.",
        tips: [
          "Browse ministry opportunities",
          "Sign up for volunteer roles",
          "Join newcomer connection groups",
          "Attend orientation events"
        ]
      }
    ]
  },
  {
    role: "volunteer",
    displayName: "Volunteer",
    welcomeMessage: "Thank you for your heart to serve! Discover tools to enhance your volunteer ministry.",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    steps: [
      {
        id: "volunteer_dashboard",
        title: "Your Volunteer Command Center",
        description: "Manage your volunteer commitments",
        page: "/volunteer",
        position: "center",
        content: "Your volunteer dashboard helps you track your service commitments, communicate with ministry leaders, and discover new opportunities to serve.",
        tips: [
          "View your volunteer schedule",
          "Track your service hours",
          "Communicate with ministry teams",
          "Find additional ways to serve"
        ],
        nextAction: "Let's explore your current commitments"
      },
      {
        id: "ministry_coordination",
        title: "Ministry Team Coordination",
        description: "Work effectively with your team",
        page: "/volunteer",
        selector: ".ministry-team",
        position: "right",
        content: "Coordinate with your ministry team, access training resources, and stay updated on ministry activities and needs.",
        tips: [
          "Team communication and updates",
          "Access training materials",
          "Submit service reports",
          "Request time off or schedule changes"
        ],
        nextAction: "Now let's look at growth and training opportunities"
      },
      {
        id: "volunteer_growth",
        title: "Volunteer Training & Development",
        description: "Grow in your service and skills",
        page: "/volunteer",
        selector: ".training-resources",
        position: "left",
        content: "Access training resources, track your volunteer development, and explore leadership opportunities within your ministry area.",
        tips: [
          "Complete required training modules",
          "Track your volunteer milestones",
          "Explore leadership development",
          "Receive feedback and recognition"
        ]
      }
    ]
  },
  {
    role: "small_group_leader",
    displayName: "Small Group Leader",
    welcomeMessage: "Lead with wisdom and love! Access tools to nurture your small group community.",
    color: "bg-teal-100 text-teal-800 border-teal-200",
    steps: [
      {
        id: "group_leadership_center",
        title: "Small Group Leadership Hub",
        description: "Shepherd your group effectively",
        page: "/groups",
        position: "center",
        content: "Your leadership center provides tools to manage your small group, track member growth, and access leadership resources.",
        tips: [
          "Manage group membership and attendance",
          "Access Bible study resources",
          "Track spiritual growth and prayer requests",
          "Coordinate group activities and events"
        ],
        nextAction: "Let's explore member care tools"
      },
      {
        id: "member_care",
        title: "Caring for Your Group Members",
        description: "Pastoral care and support",
        page: "/groups",
        selector: ".member-care",
        position: "right",
        content: "Use pastoral care tools to track member needs, manage prayer requests, and provide spiritual support to your group.",
        tips: [
          "Track member spiritual journeys",
          "Manage confidential prayer requests",
          "Coordinate care and support",
          "Access counseling resources"
        ],
        nextAction: "Now let's look at Bible study resources"
      },
      {
        id: "study_resources",
        title: "Bible Study & Teaching Tools",
        description: "Lead engaging Bible studies",
        page: "/groups",
        selector: ".study-materials",
        position: "left",
        content: "Access comprehensive Bible study materials, teaching resources, and tools to lead engaging and meaningful group discussions.",
        tips: [
          "Access curated study materials",
          "Prepare interactive discussions",
          "Track group progress through studies",
          "Connect with other group leaders"
        ]
      }
    ]
  }
];

interface InteractiveTourProps {
  isOpen: boolean;
  onClose: () => void;
  role: string;
}

export default function InteractiveTour({ isOpen, onClose, role }: InteractiveTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [location, navigate] = useLocation();
  
  const config = tourConfigs.find(c => c.role === role);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && config && config.steps[currentStep]) {
      // Navigate to the step's page
      navigate(config.steps[currentStep].page);
    }
  }, [currentStep, isOpen, config, navigate]);

  useEffect(() => {
    if (isPlaying && config) {
      const timer = setTimeout(() => {
        if (currentStep < config.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 8000); // 8 seconds per step
      
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, config]);
  
  if (!config) return null;

  const currentStepData = config.steps[currentStep];
  const progress = ((currentStep + 1) / config.steps.length) * 100;

  const handleNext = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsPlaying(false);
    onClose();
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div 
          ref={overlayRef}
          className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        />
        
        {/* Highlight area for specific elements */}
        {currentStepData.selector && (
          <div className="absolute inset-0 pointer-events-none">
            {/* This would highlight specific elements */}
            <div className="absolute border-4 border-purple-400 rounded-lg animate-pulse" />
          </div>
        )}

        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute ${getPositionClasses(currentStepData.position)} max-w-md`}
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={config.color}>
                    {config.displayName}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {config.steps.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Progress value={progress} className="h-2" />
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <CardTitle className="text-lg mb-2">
                  {currentStepData.title}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-3">
                  {currentStepData.description}
                </p>
                <p className="text-sm leading-relaxed">
                  {currentStepData.content}
                </p>
              </div>

              {currentStepData.tips && (
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 text-purple-900">
                    Key Features:
                  </h4>
                  <ul className="text-xs space-y-1 text-purple-800">
                    {currentStepData.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-500 mt-0.5">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStepData.nextAction && (
                <div className="text-xs text-gray-500 italic">
                  {currentStepData.nextAction}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                    className="gap-1"
                  >
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    {isPlaying ? "Pause" : "Auto"}
                  </Button>
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevious}
                      className="gap-1"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      Back
                    </Button>
                  )}
                </div>
                
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 gap-1"
                >
                  {currentStep === config.steps.length - 1 ? "Complete" : "Next"}
                  {currentStep < config.steps.length - 1 && <ChevronRight className="h-3 w-3" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Directional Arrow */}
        {currentStepData.selector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`absolute ${getArrowPosition(currentStepData.position)} text-purple-400`}
          >
            {getArrowIcon(currentStepData.position)}
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

function getPositionClasses(position: string): string {
  switch (position) {
    case 'top':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    case 'left':
      return 'left-4 top-1/2 transform -translate-y-1/2';
    case 'right':
      return 'right-4 top-1/2 transform -translate-y-1/2';
    case 'center':
    default:
      return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
  }
}

function getArrowPosition(position: string): string {
  switch (position) {
    case 'top':
      return 'top-32 left-1/2 transform -translate-x-1/2';
    case 'bottom':
      return 'bottom-32 left-1/2 transform -translate-x-1/2';
    case 'left':
      return 'left-80 top-1/2 transform -translate-y-1/2';
    case 'right':
      return 'right-80 top-1/2 transform -translate-y-1/2';
    default:
      return 'hidden';
  }
}

function getArrowIcon(position: string) {
  const className = "h-8 w-8 animate-bounce";
  switch (position) {
    case 'top':
      return <ArrowDown className={className} />;
    case 'bottom':
      return <ArrowUp className={className} />;
    case 'left':
      return <ArrowRight className={className} />;
    case 'right':
      return <ArrowLeft className={className} />;
    default:
      return null;
  }
}