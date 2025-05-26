"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ThemeAwareLogo } from "@/components/ui/theme-aware-logo"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Workflow, Building2, Users, HelpCircle, BookOpen, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import EnterpriseHierarchyGenerator from "@/components/enterprise-hierarchy-generator"
import EngagementRulesGenerator from "@/components/engagement-rules-generator"
import WorkflowGenerator from "@/components/workflow-generator"

export default function Home() {
  const [activeGenerator, setActiveGenerator] = useState<string | null>(null)

  const generators = [
    {
      id: "hierarchy",
      title: "Enterprise Hierarchy Generator",
      description: "Create and manage organizational structures with advanced hierarchy management capabilities",
      icon: Building2,
      gradient: "from-blue-500 to-cyan-500",
      instructions: {
        title: "Enterprise Hierarchy Generator - Complete Guide",
        content: [
          {
            section: "Overview",
            type: "info",
            items: [
              "The Enterprise Hierarchy Generator helps you create structured organizational data that can be used across your Emojot platform",
              "This tool is essential for setting up location-based routing, department structures, and administrative hierarchies",
              "The generated Excel file can be directly imported into your Emojot workflows and engagement rules",
              "Supports unlimited custom columns and hierarchical relationships",
            ],
          },
          {
            section: "Getting Started",
            type: "success",
            items: [
              "The 'Location' column is mandatory and serves as the primary identifier - it cannot be removed",
              "Start by adding your main locations (branches, offices, stores) in the Location column",
              "Use the 'Add New Column' input field to create custom attributes like Department, Manager, Region, etc.",
              "Column names should be descriptive and follow your organization's naming conventions",
              "You can reorder columns using the arrow buttons in the header for better organization",
            ],
          },
          {
            section: "Data Management Best Practices",
            type: "success",
            items: [
              "Fill in data systematically - complete one location's information before moving to the next",
              "Use consistent naming conventions (e.g., 'Main Branch' not 'main branch' or 'Main_Branch')",
              "For hierarchical data, consider using prefixes like 'Region > City > Branch' format",
              "Leave cells empty rather than using 'N/A' or '-' for missing data",
              "Use the 'Add Row' button to create new location entries",
              "Remove incorrect entries using the X button in the Actions column",
            ],
          },
          {
            section: "Import/Export Features",
            type: "info",
            items: [
              "Upload existing Excel files (.xlsx, .xls) to import your current organizational structure",
              "Ensure your uploaded file has a 'Location' column as the first or primary column",
              "The system will automatically detect and preserve all columns from your uploaded file",
              "Download your hierarchy as a properly formatted Excel file for use in other systems",
              "The exported file includes all custom columns and maintains data integrity",
              "Use the exported file as a backup or for sharing with other team members",
            ],
          },
          {
            section: "Integration with Other Tools",
            type: "success",
            items: [
              "The generated hierarchy file can be used in Workflow Generator for admin hierarchy setup",
              "Location data integrates with Engagement Rules for location-based triggers",
              "Custom fields can be referenced in workflow custom fields and notification templates",
              "Use consistent naming between hierarchy and other configuration files",
            ],
          },
          {
            section: "Common Use Cases",
            type: "info",
            items: [
              "Retail chains: Store locations with manager details and regional groupings",
              "Corporate offices: Department structures with team leads and contact information",
              "Healthcare systems: Hospital branches with department heads and specialties",
              "Educational institutions: Campus locations with administrative contacts",
              "Service companies: Service areas with assigned technicians and supervisors",
            ],
          },
        ],
      },
    },
    {
      id: "engagement",
      title: "Engagement Rules Generator",
      description: "Design intelligent engagement rules and automation workflows with advanced trigger systems",
      icon: Users,
      gradient: "from-purple-500 to-pink-500",
      instructions: {
        title: "Engagement Rules Generator - Complete Guide",
        content: [
          {
            section: "What are Engagement Rules?",
            type: "info",
            items: [
              "Engagement Rules are automated responses triggered by specific customer feedback or survey responses",
              "They use Complex Event Processing (CEP) to analyze incoming data and execute predefined actions",
              "Rules can send emails, SMS messages, or create tickets based on customer sentiment and responses",
              "Essential for real-time customer service and proactive issue resolution",
              "Generated XML files are directly compatible with the Emojot platform",
            ],
          },
          {
            section: "Rule Configuration Essentials",
            type: "success",
            items: [
              "Rule ID: Must be unique across your entire system - use sequential numbering (1, 2, 3...)",
              "Time Window: Defines how long the rule remains active (typically 5-60 minutes)",
              "Question ID: The exact ID from your survey question (e.g., q2091, q8426) - verify this in your survey setup",
              "Emote Filtering: Use this to trigger rules only for specific satisfaction levels",
              "Operators: 'gd 0' for positive feedback, 'ld 0' for negative feedback, 'eq -2' for very dissatisfied",
            ],
          },
          {
            section: "Action Types Explained",
            type: "success",
            items: [
              "EMAIL: Best for detailed notifications to management or support teams",
              "- Include recipient emails (comma-separated for multiple recipients)",
              "- Use descriptive subjects that indicate urgency and context",
              "- HTML body content allows for rich formatting and branding",
              "SMS: Ideal for immediate alerts to on-duty staff or managers",
              "- Keep messages under 160 characters for single SMS",
              "- Include essential information only (customer name, location, issue type)",
              "INCIDENT: Creates trackable tickets in your workflow system",
              "- Requires valid Workflow ID from your Workflow Generator",
              "- Automatically assigns based on your admin hierarchy rules",
            ],
          },
          {
            section: "Dynamic Tokens Reference",
            type: "info",
            items: [
              "Customer Information:",
              "- $$loyalty_Name_value$$ → Customer's full name",
              "- $$loyalty_Email_value$$ → Customer's email address",
              "- $$loyalty_Telephone_value$$ → Customer's phone number",
              "Survey Data:",
              "- $$q2091_emote$$ → Selected emote value (-2 to +2)",
              "- $$gp3700_c1_comment_value$$ → Text comments from customers",
              "- $$mediafile_p3849$$ → Uploaded files or images",
              "Location & Context:",
              "- $$emoSignature_Location_value$$ → Location from enterprise hierarchy",
              "- $$emoSignature_Department_value$$ → Department information",
              "- $$emoSignature_Service_value$$ → Service type or category",
            ],
          },
          {
            section: "Template Usage Guide",
            type: "success",
            items: [
              "Use full email templates for complete message setup (subject + body)",
              "Body-only templates when you want to customize the subject line",
              "SMS templates are pre-optimized for character limits",
              "Incident description templates include all relevant customer data",
              "Always replace placeholder IDs (q2091, gp3700) with your actual survey question/group IDs",
              "Test templates with sample data before deploying to production",
            ],
          },
          {
            section: "Best Practices & Tips",
            type: "success",
            items: [
              "Start with simple rules and gradually add complexity",
              "Test rules in a staging environment before production deployment",
              "Use clear, descriptive rule names and documentation",
              "Set appropriate time windows - too short may miss responses, too long may cause duplicates",
              "Monitor rule performance and adjust thresholds based on actual usage",
              "Keep email templates professional and include your company branding",
              "For SMS alerts, ensure recipients are available during business hours",
              "Regular review and update of rules based on business needs and feedback patterns",
            ],
          },
        ],
      },
    },
    {
      id: "workflow",
      title: "Workflow Generator",
      description: "Build comprehensive workflow systems with advanced configuration options and custom fields",
      icon: Workflow,
      gradient: "from-emerald-500 to-teal-500",
      instructions: {
        title: "Workflow Generator - Complete Guide",
        content: [
          {
            section: "Workflow Types Overview",
            type: "info",
            items: [
              "CCM (Customer Complaint Management): Designed for handling customer complaints from surveys and feedback forms",
              "ORM (Online Reputation Management): Specialized for managing online reviews from Google, Facebook, TripAdvisor, etc.",
              "Combined: Hybrid workflows that handle both internal complaints and external reviews in one system",
              "Each type has specific triggers, fields, and routing logic optimized for its use case",
              "Choose based on your primary use case - you can always create multiple workflows for different needs",
            ],
          },
          {
            section: "Basic Configuration",
            type: "success",
            items: [
              "Workflow Name: Use descriptive names like 'Customer Service Complaints' or 'Hotel Guest Feedback'",
              "Report Name Prefix: Appears before ticket numbers (e.g., 'Case #001', 'Ticket #001')",
              "Reporter Name Prefix: How customers are referred to (e.g., 'Customer', 'Guest', 'Client')",
              "Name Template: Dynamic ticket titles using variables like $type$, $location$, $priority$",
              "Description Template: Automatic descriptions for new tickets with context variables",
            ],
          },
          {
            section: "Status Flow Design",
            type: "success",
            items: [
              "Start with basic statuses: Open → In Progress → Resolved",
              "Add intermediate statuses as needed: Pending Customer, Escalated, On Hold",
              "Use color coding: Red for urgent, Yellow for in-progress, Green for resolved",
              "Set one status as 'Initial' (where new tickets start) and one as 'Final' (completion)",
              "Define clear transitions - which statuses can move to which other statuses",
              "Consider approval workflows for sensitive issues or high-value customers",
            ],
          },
          {
            section: "Custom Fields Strategy",
            type: "info",
            items: [
              "Location: Essential for routing and reporting - should match your Enterprise Hierarchy",
              "Customer Information: Name, contact details, customer ID for reference",
              "Issue Classification: Category, subcategory, severity level for reporting",
              "Business Context: Order numbers, service dates, product information",
              "Resolution Tracking: Actions taken, resolution time, customer satisfaction",
              "Use appropriate field types: enum for dropdowns, textArea for detailed descriptions",
              "Mark fields as required, read-only, or editable based on workflow stage",
            ],
          },
          {
            section: "Admin Hierarchy Setup",
            type: "success",
            items: [
              "Import your Enterprise Hierarchy file to automatically populate location data",
              "Define role-based assignments: Ticket Assignee, Creation Alerts, Resolution Alerts",
              "Set up escalation paths for unresolved tickets",
              "Configure location-based routing to ensure tickets go to the right teams",
              "Use contact filters to send notifications to relevant personnel only",
              "Test assignment rules with sample data before going live",
            ],
          },
          {
            section: "Trigger Configuration",
            type: "success",
            items: [
              "Workflow Creation Triggers: Sent when new tickets are created",
              "Assignment Triggers: Notify assignees when tickets are assigned to them",
              "Resolution Triggers: Confirm completion and gather feedback",
              "Use conditional logic for different notification rules based on ticket type or priority",
              "Configure email and SMS channels based on urgency and recipient preferences",
              "Include edit URLs in notifications for quick access to ticket details",
            ],
          },
          {
            section: "Templates and Deployment",
            type: "info",
            items: [
              "Use industry templates as starting points: Coffee Shop, Hotel, E-commerce, Tech Support",
              "Customize templates to match your specific business processes and terminology",
              "Export configurations as JSON files for deployment to your Emojot platform",
              "Keep backup copies of working configurations before making changes",
              "Test workflows thoroughly in staging environment before production deployment",
              "Document your workflow logic and train your team on the new processes",
            ],
          },
          {
            section: "Advanced Features",
            type: "success",
            items: [
              "Field Validation: Set rules for required fields, format validation, and business logic",
              "Reminders: Automatic notifications for overdue tickets or pending actions",
              "Sub-tasks: Break complex issues into manageable components",
              "Time Tracking: Monitor resolution times and team performance",
              "Reporting Integration: Ensure your workflow supports your reporting needs",
              "API Integration: Connect with external systems for data synchronization",
            ],
          },
        ],
      },
    },
  ]

  if (activeGenerator === "hierarchy") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <ThemeAwareLogo />
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveGenerator(null)}
                  className="glass-effect hover:shadow-glow transition-all duration-300"
                >
                  ← Back to Home
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in-up">
              <EnterpriseHierarchyGenerator />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeGenerator === "engagement") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <ThemeAwareLogo />
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveGenerator(null)}
                  className="glass-effect hover:shadow-glow transition-all duration-300"
                >
                  ← Back to Home
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in-up">
              <EngagementRulesGenerator />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeGenerator === "workflow") {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <ThemeAwareLogo />
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveGenerator(null)}
                  className="glass-effect hover:shadow-glow transition-all duration-300"
                >
                  ← Back to Home
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="animate-fade-in-up">
              <WorkflowGenerator />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <ThemeAwareLogo />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Main Title with extra padding */}
          <div className="pt-8 mb-12">
            <div className="animate-fade-in-up">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6 pb-2">
                Emojot CSM Suite
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Powerful tools to create, manage, and optimize your customer service management workflows with
                cutting-edge technology
              </p>
            </div>
          </div>

          {/* Main Generators */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {generators.map((generator, index) => (
              <Card
                key={generator.id}
                className="enhanced-card cursor-pointer group animate-fade-in-up hover:shadow-glow h-full"
                style={{ animationDelay: `${index * 0.2}s` }}
                onClick={() => setActiveGenerator(generator.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${generator.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <generator.icon className="w-8 h-8 text-white" />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-60 hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <HelpCircle className="h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            {generator.instructions.title}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 mt-4">
                          {generator.instructions.content.map((section, idx) => {
                            const getIcon = (type: string) => {
                              switch (type) {
                                case "warning":
                                  return <AlertCircle className="h-4 w-4" />
                                case "success":
                                  return <CheckCircle className="h-4 w-4" />
                                default:
                                  return <Info className="h-4 w-4" />
                              }
                            }

                            const getVariant = (type: string) => {
                              switch (type) {
                                case "warning":
                                  return "destructive"
                                case "success":
                                  return "default"
                                default:
                                  return "default"
                              }
                            }

                            return (
                              <Alert key={idx} variant={getVariant(section.type)} className="border-l-4">
                                <div className="flex items-center gap-2 mb-3">
                                  {getIcon(section.type)}
                                  <AlertTitle className="text-lg font-semibold">{section.section}</AlertTitle>
                                </div>
                                <AlertDescription>
                                  <ul className="space-y-3">
                                    {section.items.map((item, itemIdx) => (
                                      <li key={itemIdx} className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-current mt-2 flex-shrink-0 opacity-60" />
                                        <span className="text-sm leading-relaxed">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )
                          })}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-purple-600 transition-colors duration-300">
                    {generator.title}
                  </CardTitle>
                  <CardDescription className="text-base">{generator.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-end">
                  <Button className="w-full enhanced-button group-hover:shadow-glow">
                    Launch Generator
                    <generator.icon className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Powered by</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Emojot
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Made with</span>
              <span className="text-red-500">❤️</span>
              <span className="text-sm text-muted-foreground">by</span>
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Lankesh H.
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
