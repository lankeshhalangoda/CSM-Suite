"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { jsonTemplates } from "@/lib/workflow-templates"
import { useToast } from "@/hooks/use-toast"
import SideMenu from "@/components/side-menu"
import WorkflowForm from "@/components/workflow-form"
import { Download, List, Coffee, Hotel, Package, Code, Sparkles } from "lucide-react"

// Helper function to convert workflow name to camelCase
const convertToCamelCase = (name: string) => {
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
    .split(" ")
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase()
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join("")
}

// Get assignment triggers based on workflow type
const getAssignmentTriggersByWorkflowType = (workflowType: string, workflowName = "Customer Satisfaction Survey") => {
  const camelCaseWorkflowName = convertToCamelCase(workflowName)

  switch (workflowType) {
    case "ccm":
      return {
        triggers: [
          {
            template: "complaintAssignment_email",
            channel: "email",
            target: "employee",
            appendEditUrl: false,
          },
          {
            template: "complaintAssignment_sms",
            channel: "sms",
            target: "employee",
            appendEditUrl: true,
          },
        ],
      }
    case "orm":
      return {
        triggers: [
          {
            channel: "email",
            template: "complaintAssignment_orm_email",
            target: "employee",
          },
          {
            channel: "sms",
            template: "complaintAssignment_orm_sms",
            target: "employee",
          },
        ],
      }
    case "combined":
      return {
        triggers: [
          {
            channel: "email",
            template: "complaintAssignment_email",
            target: "employee",
            condition: {
              "==": [
                {
                  var: "type",
                },
                camelCaseWorkflowName,
              ],
            },
          },
          {
            channel: "sms",
            template: "complaintAssignment_sms",
            target: "employee",
            condition: {
              "==": [
                {
                  var: "type",
                },
                camelCaseWorkflowName,
              ],
            },
          },
          {
            channel: "email",
            template: "complaintAssignment_orm_email",
            target: "employee",
            condition: {
              "!=": [
                {
                  var: "type",
                },
                camelCaseWorkflowName,
              ],
            },
          },
          {
            channel: "sms",
            template: "complaintAssignment_orm_sms",
            target: "employee",
            condition: {
              "!=": [
                {
                  var: "type",
                },
                camelCaseWorkflowName,
              ],
            },
          },
        ],
      }
    default:
      return {
        triggers: [
          {
            template: "complaintAssignment_email",
            channel: "email",
            target: "employee",
            appendEditUrl: false,
          },
          {
            template: "complaintAssignment_sms",
            channel: "sms",
            target: "employee",
            appendEditUrl: true,
          },
        ],
      }
  }
}

// Get type values based on workflow type
const getTypeValuesByWorkflowType = (workflowType: string, workflowName = "Customer Satisfaction Survey") => {
  const camelCaseWorkflowName = convertToCamelCase(workflowName)

  switch (workflowType) {
    case "ccm":
      return [{ id: camelCaseWorkflowName, name: workflowName }]
    case "orm":
      return [
        { id: "googleMap", name: "Google" }, // Default selection
      ]
    case "combined":
      return [
        { id: camelCaseWorkflowName, name: workflowName },
        { id: "googleMap", name: "Google" }, // Default selection
      ]
    default:
      return [{ id: camelCaseWorkflowName, name: workflowName }]
  }
}

// Get custom fields based on workflow type
const getCustomFieldsByWorkflowType = (workflowType: string) => {
  const baseFields = {
    location: {
      name: "Location",
      type: "enum",
      required: true,
      readOnly: false,
      editable: true,
      values: [
        { id: "main_branch", name: "Main Branch" },
        { id: "downtown", name: "Downtown" },
        { id: "uptown", name: "Uptown" },
      ],
    },
    customer_name: {
      name: "Customer Name",
      type: "string",
      required: true,
      readOnly: false,
      editable: true,
    },
    rating: {
      name: "Rating",
      type: "string",
      required: true,
      readOnly: true,
      editable: false,
    },
    comment: {
      name: "Comment",
      type: "textArea",
      required: false,
      readOnly: true,
      editable: false,
    },
  }

  if (workflowType === "orm" || workflowType === "combined") {
    return {
      ...baseFields,
      review_platform: {
        name: "Review Platform",
        type: "enum",
        required: true,
        readOnly: true,
        editable: false,
        values: [
          { id: "google", name: "Google" },
          { id: "facebook", name: "Facebook" },
          { id: "tripadvisor", name: "TripAdvisor" },
        ],
      },
      review_url: {
        name: "Review URL",
        type: "string",
        required: false,
        readOnly: true,
        editable: false,
      },
    }
  }

  return baseFields
}

// Define comprehensive initial workflow structure
const getInitialWorkflow = (workflowType = "ccm", workflowName = "Customer Satisfaction Survey") => {
  const baseWorkflow = {
    workflowName: workflowName,
    workflowType: workflowType,
    reportNamePrefix: "Case",
    reporterNamePrefix: "Customer",
    nameTemplate: "Customer Complaint: $type$",
    descriptionTemplate: "Customer Complaint from $type$",
    descriptionFormat: "text", // Always text
    timeZone: -330, // Always -330
    reportSensor: "inci1", // Always inci1
    adminListName: "adminList",
    type: {
      name: "Type",
      type: "enum",
      values: getTypeValuesByWorkflowType(workflowType, workflowName),
    },
    statusFlow: {
      name: "Status",
      statuses: [
        {
          id: "Open",
          name: "Open",
          backgroundColor: "#f4b000",
          textColor: "#ffffff",
          statusTextColor: "#f4b000",
          statusBackgroundColor: "#fef3c7",
          isInitial: true,
        },
        {
          id: "In Progress",
          name: "In Progress",
          backgroundColor: "#0088cc",
          textColor: "#ffffff",
          statusTextColor: "#0088cc",
          statusBackgroundColor: "#dbeafe",
        },
        {
          id: "Resolved",
          name: "Resolved",
          backgroundColor: "#00aa55",
          textColor: "#ffffff",
          statusTextColor: "#00aa55",
          statusBackgroundColor: "#dcfce7",
          isFinal: true,
          finalState: true,
        },
      ],
      transitions: [
        { sourceState: "Open", targetStates: ["In Progress"] },
        { sourceState: "In Progress", targetStates: ["Resolved"] },
      ],
    },
    priority: {
      name: "Priority",
      type: "enum",
      values: [
        { id: "Low", name: "Low" },
        { id: "Medium", name: "Medium" },
        { id: "High", name: "High" },
      ],
    },
    customFields: getCustomFieldsByWorkflowType(workflowType),
    adminHierarchy: {
      list: "adminList",
      id: `AHI_${Date.now()}_${Math.floor(Math.random() * 1000000000)}`,
      headers: [
        { id: "location", name: "Location", type: "customField" },
        { id: "ticketAssignee", name: "Ticket Assignee", type: "contact" },
        { id: "ticketCreationAlert", name: "Ticket Creation Alert", type: "contact" },
        { id: "ticketResolutionAlert", name: "Ticket Resolution Alert", type: "contact" },
      ],
    },
    timeSpent: {
      name: "Time Spent",
      type: "number",
      hidden: true,
    },
    // Assignment triggers based on workflow type
    assignment: getAssignmentTriggersByWorkflowType(workflowType, workflowName),
    // Mandatory workflow creation triggers
    workflowCreation: {
      email: "bot@emojot.com",
      triggers: [
        {
          channel: "email",
          template: "complaintCreationAlert",
          target: "admin",
          contactFilters: ["location"],
          adminUserQuery: {
            condition: "and",
            rules: [
              {
                field: "location",
                operator: "eq",
                value: "$location$",
              },
            ],
          },
        },
      ],
    },
  }

  return baseWorkflow
}

const initialWorkflow = getInitialWorkflow("ccm")

// Quick start templates with icons
const quickStartTemplates = [
  {
    id: "Barista",
    name: "Coffee Shop Management",
    description: "Customer service workflow for coffee shops with location-based routing",
    icon: Coffee,
  },
  {
    id: "Grand Hotel",
    name: "Hotel Management",
    description: "Guest service management with room and service tracking",
    icon: Hotel,
  },
  {
    id: "Selyn",
    name: "E-commerce Support",
    description: "Product and delivery issue management for online stores",
    icon: Package,
  },
  {
    id: "Dipra",
    name: "Tech Support",
    description: "Technical support workflow with version and device tracking",
    icon: Code,
  },
]

export default function WorkflowGenerator() {
  const [workflow, setWorkflow] = useState(initialWorkflow)
  const [currentSection, setCurrentSection] = useState("basicInfo")
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (workflow.workflowType && workflow.workflowName) {
      const updatedAssignment = getAssignmentTriggersByWorkflowType(workflow.workflowType, workflow.workflowName)
      setWorkflow((prev) => ({
        ...prev,
        assignment: updatedAssignment,
      }))
    }
  }, [workflow.workflowType, workflow.workflowName])

  // Add function to handle workflow type changes
  const handleWorkflowTypeChange = (newType: string) => {
    const newWorkflow = getInitialWorkflow(newType, workflow.workflowName)
    // Preserve user-entered basic info
    newWorkflow.workflowName = workflow.workflowName
    newWorkflow.reportNamePrefix = workflow.reportNamePrefix
    newWorkflow.reporterNamePrefix = workflow.reporterNamePrefix
    newWorkflow.nameTemplate = workflow.nameTemplate
    newWorkflow.descriptionTemplate = workflow.descriptionTemplate

    // Ensure assignment triggers are updated based on the new workflow type
    newWorkflow.assignment = getAssignmentTriggersByWorkflowType(newType, newWorkflow.workflowName)

    setWorkflow(newWorkflow)
  }

  // Define the sections for the side menu
  const sections = [
    { id: "basicInfo", label: "Basic Information" },
    { id: "typeConfig", label: "Type Configuration" },
    { id: "statusConfig", label: "Status Configuration" },
    { id: "transitions", label: "Transitions" },
    { id: "priorityConfig", label: "Priority Configuration" },
    { id: "customFields", label: "Custom Fields" },
    { id: "adminHierarchy", label: "Admin Hierarchy" },
    { id: "triggers", label: "Triggers" },
    { id: "assignment", label: "Assignment" },
    { id: "notifications", label: "Notifications" },
    { id: "fieldValidation", label: "Field Validation" },
    { id: "reminders", label: "Reminders" },
    { id: "subTasks", label: "Sub-Tasks" },
    { id: "advancedConfig", label: "Advanced Configuration" },
    { id: "exportOptions", label: "Export Options" },
  ]

  // Load a template
  const loadTemplate = (templateName: string) => {
    if (jsonTemplates[templateName]) {
      const template = jsonTemplates[templateName]

      // Transform the template into our workflow structure
      const newWorkflow = {
        ...initialWorkflow,
        workflowName: template.name || "",
        reportNamePrefix: template.reportNamePrefix || "Case",
        reporterNamePrefix: template.reporterNamePrefix || "Customer",
        nameTemplate: template.nameTemplate || "",
        descriptionTemplate: template.descriptionTemplate || "",
        type: template.type || initialWorkflow.type,
        statusFlow: {
          name: "Status",
          statuses: template.status.values.map((status: any) => ({
            id: status.id,
            name: status.name,
            backgroundColor: status.backgroundColor || "#e6e6e6",
            textColor: status.textColor || "#000000",
            statusTextColor: status.statusTextColor || status.backgroundColor || "#e6e6e6",
            statusBackgroundColor: status.statusBackgroundColor || "#f5f5f5",
            highPriorityFields: status.highPriorityFields || [],
            editableFields: status.editableFields || [],
            fieldsValidation: status.fieldsValidation || [],
          })),
          transitions: template.status.transitions || [],
        },
        priority: template.priority || initialWorkflow.priority,
        customFields: template.customFields || {},
        adminHierarchy: template.adminHierarchy || initialWorkflow.adminHierarchy,
      }

      setWorkflow(newWorkflow)
      setTemplateDialogOpen(false)

      toast({
        title: "Template Loaded",
        description: `The ${templateName} template has been loaded successfully.`,
      })
    }
  }

  // Generate JSON for export
  const generateJson = () => {
    // Transform the workflow data into the expected JSON format
    const workflowJson: any = {
      reportNamePrefix: workflow.reportNamePrefix || `${workflow.workflowName} Ticket`,
      reporterNamePrefix: workflow.reporterNamePrefix || "Customer",
      descriptionFormat: "text", // Always text as per requirements
      name: workflow.workflowName,
      nameTemplate: workflow.nameTemplate || `${workflow.workflowName} Complaint: $type$`,
      descriptionTemplate: workflow.descriptionTemplate || "Customer Complaint from $type$",
      type: workflow.type,
      status: {
        name: "Status",
        type: "enum",
        values: workflow.statusFlow.statuses.map((status) => {
          const statusObj: any = {
            id: status.id,
            name: status.name,
          }

          if (status.backgroundColor) {
            statusObj.backgroundColor = status.backgroundColor
          }

          if (status.textColor) {
            statusObj.textColor = status.textColor
          }

          if (status.statusTextColor) {
            statusObj.statusTextColor = status.statusTextColor
          }

          if (status.statusBackgroundColor) {
            statusObj.statusBackgroundColor = status.statusBackgroundColor
          }

          return statusObj
        }),
      },
      priority: workflow.priority,
      customFields: workflow.customFields,
      timeZone: -330, // Always -330 as per requirements
    }

    // Add transitions if they exist
    if (workflow.statusFlow.transitions && workflow.statusFlow.transitions.length > 0) {
      workflowJson.status.transitions = workflow.statusFlow.transitions
    }

    return JSON.stringify(workflowJson, null, 2)
  }

  // Download the workflow JSON
  const downloadJson = () => {
    const json = generateJson()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${workflow.workflowName || "workflow"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Workflow Generator</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <List className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Quick Start Templates
                  </DialogTitle>
                  <DialogDescription>Choose from industry-specific templates to get started quickly</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {quickStartTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => loadTemplate(template.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <template.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-medium mb-1">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={downloadJson}>
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => setWorkflow(initialWorkflow)}>
              Reset
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-64 shrink-0">
              <SideMenu sections={sections} currentSection={currentSection} onSectionChange={setCurrentSection} />
            </div>
            <div className="flex-1">
              <WorkflowForm
                workflow={workflow}
                setWorkflow={setWorkflow}
                currentSection={currentSection}
                handleWorkflowTypeChange={handleWorkflowTypeChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
