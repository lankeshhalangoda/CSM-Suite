"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Download, Trash, FileCode, Copy, HelpCircle, BookOpen, AlertCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define types for our engagement rules
interface CustomField {
  key: string
  value: string
}

interface RuleAction {
  type: "email" | "sms" | "incident"
  data: {
    // Common fields
    validityPeriod?: string

    // Email specific
    to?: string
    subject?: string
    bodyType?: string
    body?: string

    // SMS specific
    smsTo?: string
    smsType?: string
    smsbody?: string

    // Incident specific
    workflowID?: string
    name?: string
    assignee?: string
    type?: string
    priority?: string
    status?: string
    description?: string
    customFields?: CustomField[]
  }
}

interface Rule {
  id: number
  timeWindow: number
  params: {
    questionId: string
    useJoinParam: boolean
    operator: string
    value: string
  }
  action: RuleAction
}

// Prebuilt templates
const emailTemplates = [
  {
    name: "Customer Complaint - Low Rating",
    subject: "Alert! - Customer has provided a low rating",
    body: `<p>Hello Admin,</p>
<p>A customer has expressed dissatisfaction with our service:</p>
<p>
    <strong>Customer Name:</strong> $$loyalty_Name_value$$<br>
    <strong>Telephone:</strong> $$loyalty_Telephone_value$$<br>
    <strong>Email:</strong> $$loyalty_Email_value$$<br>
    <strong>Location:</strong> $$emoSignature_Location_value$$<br>
    <strong>Rating:</strong> $$q2091_emote$$<br>
    <strong>Comment:</strong> $$gp3700_c1_comment_value$$
</p>
<p>Please address this issue promptly.</p>

<p>Best Regards,</p>
<p><strong>Customer Support Team</strong></p>`,
  },
  {
    name: "Employee Complaint",
    subject: "Alert! - Employee complaint received",
    body: `<p>Hello HR Team,</p>
<p>An employee has submitted a complaint:</p>
<p>
    <strong>Employee Name:</strong> $$loyalty_Name_value$$<br>
    <strong>Department:</strong> $$emoSignature_Department_value$$<br>
    <strong>Position:</strong> $$emoSignature_Position_value$$<br>
    <strong>Complaint Type:</strong> $$emoSignature_ComplaintType_value$$<br>
    <strong>Details:</strong> $$gp3700_c1_comment_value$$
</p>
<p>Please investigate this matter according to company policy.</p>

<p>Best Regards,</p>
<p><strong>HR Management System</strong></p>`,
  },
  {
    name: "New Feedback Received",
    subject: "New Feedback Received - $$emoSignature_Location_value$$",
    body: `<p>Hello Team,</p>
<p>We have received new feedback from a customer:</p>
<p>
    <strong>Customer Name:</strong> $$loyalty_Name_value$$<br>
    <strong>Telephone:</strong> $$loyalty_Telephone_value$$<br>
    <strong>Email:</strong> $$loyalty_Email_value$$<br>
    <strong>Location:</strong> $$emoSignature_Location_value$$<br>
    <strong>Rating:</strong> $$q2091_emote$$<br>
    <strong>Comment:</strong> $$gp3700_c1_comment_value$$
</p>
<p>Please review this feedback for continuous improvement.</p>

<p>Best Regards,</p>
<p><strong>Feedback Management System</strong></p>`,
  },
  {
    name: "Product Issue Report",
    subject: "Product Issue Reported - Requires Attention",
    body: `<p>Hello Product Team,</p>
<p>A customer has reported an issue with one of our products:</p>
<p>
    <strong>Customer Name:</strong> $$loyalty_Name_value$$<br>
    <strong>Telephone:</strong> $$loyalty_Telephone_value$$<br>
    <strong>Email:</strong> $$loyalty_Email_value$$<br>
    <strong>Product:</strong> $$emoSignature_Product_value$$<br>
    <strong>Issue Description:</strong> $$gp3700_c1_comment_value$$<br>
    <strong>Attachment:</strong> $$mediafile_p3849$$
</p>
<p>Please investigate this issue and provide a resolution.</p>

<p>Best Regards,</p>
<p><strong>Customer Support Team</strong></p>`,
  },
  {
    name: "Thank You - Positive Feedback",
    subject: "Thank You for Your Positive Feedback",
    body: `<p>Dear $$loyalty_Name_value$$,</p>

<p>Thank you for your positive feedback about our services at $$emoSignature_Location_value$$. We're delighted to hear that you had a great experience with us.</p>

<p>Your satisfaction is our priority, and we appreciate you taking the time to share your thoughts.</p>

<p>We look forward to serving you again soon!</p>

<p>Best Regards,</p>
<p><strong>Customer Experience Team</strong></p>`,
  },
  {
    name: "Staff Recognition",
    subject: "Staff Recognition Notification",
    body: `<p>Hello Management Team,</p>

<p>A customer has recognized one of our staff members for exceptional service:</p>

<p>
    <strong>Staff Member:</strong> $$gp3487_c1_comment_value$$<br>
    <strong>Department:</strong> $$emoSignature_Department_value$$<br>
    <strong>Location:</strong> $$emoSignature_Location_value$$<br>
    <strong>Customer Comment:</strong> $$gp3700_c1_comment_value$$<br>
    <strong>Customer Name:</strong> $$loyalty_Name_value$$<br>
</p>

<p>Please consider recognizing this team member for their outstanding service.</p>

<p>Best Regards,</p>
<p><strong>Customer Experience Team</strong></p>`,
  },
]

// Email body templates (just the body content)
const emailBodyTemplates = [
  {
    name: "Customer Complaint",
    body: `<p>Hello Admin,</p>
<p>A customer has expressed dissatisfaction with our service:</p>
<p>
    <strong>Customer Name:</strong> $$loyalty_Name_value$$<br>
    <strong>Telephone:</strong> $$loyalty_Telephone_value$$<br>
    <strong>Email:</strong> $$loyalty_Email_value$$<br>
    <strong>Location:</strong> $$emoSignature_Location_value$$<br>
    <strong>Rating:</strong> $$q2091_emote$$<br>
    <strong>Comment:</strong> $$gp3700_c1_comment_value$$
</p>
<p>Please address this issue promptly.</p>

<p>Best Regards,</p>
<p><strong>Customer Support Team</strong></p>`,
  },
  {
    name: "Thank You Message",
    body: `<p>Dear $$loyalty_Name_value$$,</p>

<p>Thank you for your feedback about our services at $$emoSignature_Location_value$$. We value your input and are committed to providing excellent service.</p>

<p>Your feedback helps us improve and better serve our customers.</p>

<p>We look forward to serving you again soon!</p>

<p>Best Regards,</p>
<p><strong>Customer Experience Team</strong></p>`,
  },
  {
    name: "Service Update",
    body: `<p>Dear $$loyalty_Name_value$$,</p>

<p>We wanted to update you on the status of your recent service request:</p>

<p>
    <strong>Service Type:</strong> $$emoSignature_Service_value$$<br>
    <strong>Status:</strong> In Progress<br>
    <strong>Expected Completion:</strong> Within 48 hours<br>
</p>

<p>If you have any questions, please don't hesitate to contact us.</p>

<p>Best Regards,</p>
<p><strong>Customer Service Team</strong></p>`,
  },
  {
    name: "Appointment Confirmation",
    body: `<p>Dear $$loyalty_Name_value$$,</p>

<p>This email confirms your upcoming appointment:</p>

<p>
    <strong>Service:</strong> $$emoSignature_Service_value$$<br>
    <strong>Location:</strong> $$emoSignature_Location_value$$<br>
    <strong>Date/Time:</strong> [Insert Date/Time]<br>
</p>

<p>If you need to reschedule, please contact us at least 24 hours in advance.</p>

<p>Best Regards,</p>
<p><strong>Appointment Team</strong></p>`,
  },
  {
    name: "Feedback Request",
    body: `<p>Dear $$loyalty_Name_value$$,</p>

<p>We value your opinion and would appreciate your feedback on your recent experience with us.</p>

<p>Your insights help us improve our services and better meet your needs.</p>

<p>Thank you for choosing our services.</p>

<p>Best Regards,</p>
<p><strong>Customer Experience Team</strong></p>`,
  },
]

const smsTemplates = [
  {
    name: "Customer Complaint Alert",
    body: `ALERT: Customer complaint received from $$loyalty_Name_value$$ at $$emoSignature_Location_value$$. Rating: $$q2091_emote$$. Contact: $$loyalty_Telephone_value$$`,
  },
  {
    name: "Employee Complaint Alert",
    body: `ALERT: Employee complaint from $$loyalty_Name_value$$ in $$emoSignature_Department_value$$. Please check system for details.`,
  },
  {
    name: "New Feedback Alert",
    body: `New feedback received from $$loyalty_Name_value$$ for $$emoSignature_Location_value$$. Rating: $$q2091_emote$$. Please review.`,
  },
  {
    name: "Product Issue Alert",
    body: `Product issue reported by $$loyalty_Name_value$$ for $$emoSignature_Product_value$$. Contact: $$loyalty_Telephone_value$$`,
  },
  {
    name: "Thank You Message",
    body: `Thank you for your feedback, $$loyalty_Name_value$$! We value your input and are committed to providing excellent service.`,
  },
  {
    name: "Staff Recognition Alert",
    body: `Staff recognition alert: $$gp3487_c1_comment_value$$ at $$emoSignature_Location_value$$ has been recognized by a customer for excellent service.`,
  },
]

// SMS body templates (just the message content)
const smsBodyTemplates = [
  {
    name: "Customer Complaint",
    body: `ALERT: Customer complaint from $$loyalty_Name_value$$. Rating: $$q2091_emote$$. Contact: $$loyalty_Telephone_value$$`,
  },
  {
    name: "Thank You",
    body: `Thank you for your feedback, $$loyalty_Name_value$$! We value your input and are committed to providing excellent service.`,
  },
  {
    name: "Appointment Reminder",
    body: `Reminder: Your appointment is scheduled for [DATE/TIME]. Location: $$emoSignature_Location_value$$. Reply Y to confirm.`,
  },
  {
    name: "Service Update",
    body: `Update: Your service request has been processed. Status: In Progress. Est. completion: 48hrs. Questions? Call us.`,
  },
  {
    name: "Feedback Request",
    body: `$$loyalty_Name_value$$, we value your opinion! Please share your feedback about your recent experience with us.`,
  },
]

const incidentDescriptions = [
  {
    name: "Customer Complaint",
    description: `Customer Name: $$loyalty_Name_value$$
Customer Email: $$loyalty_Email_value$$
Customer Telephone: $$loyalty_Telephone_value$$
Location: $$emoSignature_Location_value$$
Rating: $$q2091_emote$$
Comment: $$gp3700_c1_comment_value$$`,
  },
  {
    name: "Employee Complaint",
    description: `Employee Name: $$loyalty_Name_value$$
Employee Email: $$loyalty_Email_value$$
Employee Telephone: $$loyalty_Telephone_value$$
Department: $$emoSignature_Department_value$$
Position: $$emoSignature_Position_value$$
Complaint Type: $$emoSignature_ComplaintType_value$$
Details: $$gp3700_c1_comment_value$$`,
  },
  {
    name: "Product Issue",
    description: `Customer Name: $$loyalty_Name_value$$
Customer Email: $$loyalty_Email_value$$
Customer Telephone: $$loyalty_Telephone_value$$
Product: $$emoSignature_Product_value$$
Issue Description: $$gp3700_c1_comment_value$$
Attachment: $$mediafile_p3849$$`,
  },
  {
    name: "Service Feedback",
    description: `Customer Name: $$loyalty_Name_value$$
Customer Email: $$loyalty_Email_value$$
Customer Telephone: $$loyalty_Telephone_value$$
Location: $$emoSignature_Location_value$$
Service: $$emoSignature_Service_value$$
Rating: $$q2091_emote$$
Feedback: $$gp3700_c1_comment_value$$`,
  },
  {
    name: "Staff Recognition",
    description: `Staff Member: $$gp3487_c1_comment_value$$
Department: $$emoSignature_Department_value$$
Location: $$emoSignature_Location_value$$
Customer Comment: $$gp3700_c1_comment_value$$
Customer Name: $$loyalty_Name_value$$
Customer Contact: $$loyalty_Telephone_value$$`,
  },
  {
    name: "Technical Support Request",
    description: `Customer Name: $$loyalty_Name_value$$
Customer Email: $$loyalty_Email_value$$
Customer Telephone: $$loyalty_Telephone_value$$
Device/System: $$emoSignature_System_value$$
Issue Description: $$gp3700_c1_comment_value$$
Error Message: $$gp3700_c2_comment_value$$
Screenshot: $$mediafile_p3849$$`,
  },
]

export default function EngagementRulesGenerator() {
  const [rules, setRules] = useState<Rule[]>([])
  const [currentRule, setCurrentRule] = useState<Rule>({
    id: 1,
    timeWindow: 5,
    params: {
      questionId: "",
      useJoinParam: true,
      operator: "gd",
      value: "0",
    },
    action: {
      type: "email",
      data: {
        validityPeriod: "5",
      },
    },
  })

  const [xmlPreview, setXmlPreview] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("rule-editor")

  // Update XML preview whenever rules change
  useEffect(() => {
    if (rules.length > 0) {
      const xml = generateFullXml(rules)
      setXmlPreview(xml)
    } else {
      setXmlPreview("")
    }
  }, [rules])

  // Operators for emote values
  const operators = [
    { value: "eq", label: "Equal to (eq)" },
    { value: "nEq", label: "Not equal to (nEq)" },
    { value: "gd", label: "Greater than (gd)" },
    { value: "ld", label: "Less than (ld)" },
    { value: "gdOrEq", label: "Greater than or equal to (gdOrEq)" },
    { value: "ldOrEq", label: "Less than or equal to (ldOrEq)" },
  ]

  // Handle adding a custom field for incident action
  const addCustomField = () => {
    const updatedRule = { ...currentRule }
    if (!updatedRule.action.data.customFields) {
      updatedRule.action.data.customFields = []
    }
    updatedRule.action.data.customFields.push({ key: "", value: "" })
    setCurrentRule(updatedRule)
  }

  // Handle updating a custom field
  const updateCustomField = (index: number, field: "key" | "value", value: string) => {
    const updatedRule = { ...currentRule }
    if (updatedRule.action.data.customFields) {
      updatedRule.action.data.customFields[index][field] = value
      setCurrentRule(updatedRule)
    }
  }

  // Handle removing a custom field
  const removeCustomField = (index: number) => {
    const updatedRule = { ...currentRule }
    if (updatedRule.action.data.customFields) {
      updatedRule.action.data.customFields.splice(index, 1)
      setCurrentRule(updatedRule)
    }
  }

  // Apply email template
  const applyEmailTemplate = (templateName: string) => {
    const template = emailTemplates.find((t) => t.name === templateName)
    if (template) {
      setCurrentRule({
        ...currentRule,
        action: {
          ...currentRule.action,
          data: {
            ...currentRule.action.data,
            subject: template.subject,
            body: template.body,
          },
        },
      })
    }
  }

  // Apply email body template
  const applyEmailBodyTemplate = (templateName: string) => {
    const template = emailBodyTemplates.find((t) => t.name === templateName)
    if (template) {
      setCurrentRule({
        ...currentRule,
        action: {
          ...currentRule.action,
          data: {
            ...currentRule.action.data,
            body: template.body,
          },
        },
      })
    }
  }

  // Apply SMS template
  const applySmsTemplate = (templateName: string) => {
    const template = smsTemplates.find((t) => t.name === templateName)
    if (template) {
      setCurrentRule({
        ...currentRule,
        action: {
          ...currentRule.action,
          data: {
            ...currentRule.action.data,
            smsbody: template.body,
          },
        },
      })
    }
  }

  // Apply SMS body template
  const applySmsBodyTemplate = (templateName: string) => {
    const template = smsBodyTemplates.find((t) => t.name === templateName)
    if (template) {
      setCurrentRule({
        ...currentRule,
        action: {
          ...currentRule.action,
          data: {
            ...currentRule.action.data,
            smsbody: template.body,
          },
        },
      })
    }
  }

  // Apply incident description template
  const applyDescriptionTemplate = (templateName: string) => {
    const template = incidentDescriptions.find((t) => t.name === templateName)
    if (template) {
      setCurrentRule({
        ...currentRule,
        action: {
          ...currentRule.action,
          data: {
            ...currentRule.action.data,
            description: template.description,
          },
        },
      })
    }
  }

  // Generate XML for a single rule
  const generateRuleXml = (rule: Rule): string => {
    let xml = `  <cepRule id="${rule.id}" timeWindow="${rule.timeWindow}">\n`

    // Add params
    xml += `    <params>\n`
    xml += `      <param>\n`
    xml += `        <name>percepticDrillDown</name>\n`
    xml += `        <operator>eq</operator>\n`
    xml += `        <value>"${rule.params.questionId}"</value>\n`
    xml += `      </param>\n`

    // Add join param if enabled
    if (rule.params.useJoinParam) {
      xml += `      <joinOperator>and</joinOperator>\n`
      xml += `      <joinParam>\n`
      xml += `        <name>emoteNumericValue</name>\n`
      xml += `        <operator>${rule.params.operator}</operator>\n`
      xml += `        <value>${rule.params.value}</value>\n`
      xml += `      </joinParam>\n`
    }

    xml += `    </params>\n`

    // Add engagement actions
    xml += `    <engagementActions>\n`
    xml += `      <action>\n`
    xml += `        <type>${rule.action.type}</type>\n`
    xml += `        <data>\n`

    // Add action-specific data
    switch (rule.action.type) {
      case "email":
        if (rule.action.data.to) xml += `          <to>${rule.action.data.to}</to>\n`
        if (rule.action.data.subject) xml += `          <subject>${rule.action.data.subject}</subject>\n`
        if (rule.action.data.bodyType || true) xml += `          <bodyType>html</bodyType>\n`
        if (rule.action.data.body) {
          xml += `          <body><![CDATA[\n${rule.action.data.body}\n]]></body>\n`
        }
        break

      case "sms":
        if (rule.action.data.smsType || true) xml += `          <smsType>smsbody</smsType>\n`
        if (rule.action.data.smsTo) xml += `          <smsTo>${rule.action.data.smsTo}</smsTo>\n`
        if (rule.action.data.smsbody) xml += `          <smsbody>${rule.action.data.smsbody}</smsbody>\n`
        break

      case "incident":
        if (rule.action.data.workflowID) xml += `          <workflowID>${rule.action.data.workflowID}</workflowID>\n`
        if (rule.action.data.name) xml += `          <name>${rule.action.data.name}</name>\n`
        if (rule.action.data.assignee) xml += `          <assignee>${rule.action.data.assignee}</assignee>\n`
        if (rule.action.data.type) xml += `          <type>${rule.action.data.type}</type>\n`
        if (rule.action.data.priority) xml += `          <priority>${rule.action.data.priority}</priority>\n`
        if (rule.action.data.status) xml += `          <status>${rule.action.data.status}</status>\n`
        if (rule.action.data.description) {
          xml += `          <description>\n${rule.action.data.description}\n          </description>\n`
        }

        // Add custom fields if any
        if (rule.action.data.customFields && rule.action.data.customFields.length > 0) {
          xml += `          <customFields>\n`
          rule.action.data.customFields.forEach((field) => {
            if (field.key && field.value) {
              xml += `            <field>\n`
              xml += `              <key>${field.key}</key>\n`
              xml += `              <value>${field.value}</value>\n`
              xml += `            </field>\n`
            }
          })
          xml += `          </customFields>\n`
        }
        break
    }

    // Add validity period
    if (rule.action.data.validityPeriod) {
      xml += `        </data>\n`
      xml += `        <validityPeriod>${rule.action.data.validityPeriod}</validityPeriod>\n`
    } else {
      xml += `        </data>\n`
    }

    xml += `      </action>\n`
    xml += `    </engagementActions>\n`
    xml += `  </cepRule>\n`

    return xml
  }

  // Generate the full XML document
  const generateFullXml = (rulesList: Rule[] = rules): string => {
    let xml = '<?xml version="1.0"?>\n<cepRules>\n'

    rulesList.forEach((rule) => {
      xml += generateRuleXml(rule)
    })

    xml += "</cepRules>"
    return xml
  }

  // Add the current rule to the rules list
  const addRule = () => {
    // Validate required fields
    if (!currentRule.params.questionId) {
      alert("Question ID is required!")
      return
    }

    switch (currentRule.action.type) {
      case "email":
        if (!currentRule.action.data.to) {
          alert("Email recipient is required!")
          return
        }
        if (!currentRule.action.data.subject) {
          alert("Email subject is required!")
          return
        }
        break

      case "sms":
        if (!currentRule.action.data.smsTo) {
          alert("SMS recipient is required!")
          return
        }
        if (!currentRule.action.data.smsbody) {
          alert("SMS body is required!")
          return
        }
        break

      case "incident":
        if (!currentRule.action.data.workflowID) {
          alert("Workflow ID is required!")
          return
        }
        break
    }

    // Add the rule
    const newRules = [...rules, { ...currentRule }]
    setRules(newRules)

    // Update the XML preview immediately
    const xml = generateFullXml(newRules)
    setXmlPreview(xml)

    // Reset the current rule with incremented ID
    setCurrentRule({
      ...currentRule,
      id: currentRule.id + 1,
      params: {
        ...currentRule.params,
        questionId: "",
      },
      action: {
        type: currentRule.action.type,
        data: {
          validityPeriod: "5",
        },
      },
    })
  }

  // Remove a rule
  const removeRule = (index: number) => {
    const newRules = [...rules]
    newRules.splice(index, 1)
    setRules(newRules)

    // Update the XML preview
    const xml = newRules.length > 0 ? generateFullXml(newRules) : ""
    setXmlPreview(xml)
  }

  // Download the XML file
  const downloadXml = () => {
    if (rules.length === 0) {
      alert("Please add at least one rule before downloading!")
      return
    }

    const xml = generateFullXml()
    const blob = new Blob([xml], { type: "application/xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "engagement_rules.xml"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Copy XML to clipboard
  const copyXmlToClipboard = () => {
    if (rules.length === 0) {
      alert("Please add at least one rule before copying!")
      return
    }

    const xml = generateFullXml()
    navigator.clipboard
      .writeText(xml)
      .then(() => alert("XML copied to clipboard!"))
      .catch((err) => {
        console.error("Failed to copy XML:", err)
        alert("Failed to copy XML to clipboard!")
      })
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl">Engagement Rules Generator</CardTitle>
          <CardDescription>Create XML-based engagement rules for Emojot platform</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Engagement Rules Generator Guide
              </DialogTitle>
              <DialogDescription>
                Learn how to create and manage engagement rules for the Emojot platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-semibold">What are Engagement Rules?</h3>
                <p className="text-muted-foreground mt-1">
                  Engagement Rules (ER) in Emojot are Complex Event Processing (CEP) rules written in XML format that
                  define automatic actions based on specific survey responses.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">How to Create a Rule</h3>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                  <li>
                    <strong>Configure Rule Parameters</strong>
                    <ul className="list-disc list-inside ml-6 text-muted-foreground">
                      <li>Set a unique Rule ID</li>
                      <li>Enter the Question ID (e.g., q2091)</li>
                      <li>Choose whether to filter by emote value</li>
                      <li>If filtering, select an operator and value</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Select an Action Type</strong>
                    <ul className="list-disc list-inside ml-6 text-muted-foreground">
                      <li>
                        <strong>Email</strong>: Sends an email notification
                      </li>
                      <li>
                        <strong>SMS</strong>: Sends an SMS alert
                      </li>
                      <li>
                        <strong>Incident</strong>: Creates a ticket in the system
                      </li>
                    </ul>
                  </li>
                  <li>
                    <strong>Configure Action Details</strong>
                    <ul className="list-disc list-inside ml-6 text-muted-foreground">
                      <li>Fill in required fields for your chosen action type</li>
                      <li>Use templates for common scenarios</li>
                      <li>Add dynamic tokens to personalize content</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Add the Rule</strong> by clicking the "Add Rule" button
                  </li>
                  <li>
                    <strong>Preview and Download</strong> the generated XML
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Understanding Emote Values</h3>
                <p className="text-muted-foreground mt-1">
                  Emote values represent customer responses on a numeric scale:
                </p>
                <ul className="list-disc list-inside ml-6 text-muted-foreground">
                  <li>5 emotes = -2, -1, 0, 1, 2</li>
                  <li>4 emotes = -2, -1, 0, 1</li>
                </ul>
                <p className="text-muted-foreground mt-1">Common operators:</p>
                <ul className="list-disc list-inside ml-6 text-muted-foreground">
                  <li>
                    <strong>gd 0</strong>: Greater than 0 (positive feedback)
                  </li>
                  <li>
                    <strong>ld 0</strong>: Less than 0 (negative feedback)
                  </li>
                  <li>
                    <strong>eq -2</strong>: Equal to -2 (very dissatisfied)
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Using Dynamic Tokens</h3>
                <p className="text-muted-foreground mt-1">
                  Tokens allow you to include dynamic content in your actions:
                </p>
                <ul className="list-disc list-inside ml-6 text-muted-foreground">
                  <li>
                    <code>$$loyalty_Name_value$$</code>: Customer's name
                  </li>
                  <li>
                    <code>$$loyalty_Email_value$$</code>: Customer's email
                  </li>
                  <li>
                    <code>$$loyalty_Telephone_value$$</code>: Customer's phone
                  </li>
                  <li>
                    <code>$$q2091_emote$$</code>: Selected emote for question 2091
                  </li>
                  <li>
                    <code>$$gp3700_c1_comment_value$$</code>: Comment field content
                  </li>
                  <li>
                    <code>$$emoSignature_Location_value$$</code>: Location from EH
                  </li>
                  <li>
                    <code>$$mediafile_p3849$$</code>: Media file uploaded by customer
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Important Notes</h3>
                <ul className="list-disc list-inside ml-6 text-muted-foreground">
                  <li>
                    <strong>Replace Question IDs</strong>: Make sure to replace placeholder question IDs (q2091, q8426,
                    etc.) with your actual question IDs
                  </li>
                  <li>
                    <strong>Replace Group IDs</strong>: Replace placeholder group IDs (gp3700, gp3849, etc.) with your
                    actual group IDs
                  </li>
                  <li>
                    <strong>Test Your Rules</strong>: Always test your rules after implementation to ensure they work as
                    expected
                  </li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="rule-editor">Rule Editor</TabsTrigger>
            <TabsTrigger value="xml-preview">XML Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="rule-editor" className="space-y-6">
            {/* Rule Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Rule Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule-id">Rule ID</Label>
                  <Input
                    id="rule-id"
                    type="number"
                    value={currentRule.id}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        id: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="time-window">Time Window</Label>
                  <Input
                    id="time-window"
                    type="number"
                    value={currentRule.timeWindow}
                    onChange={(e) =>
                      setCurrentRule({
                        ...currentRule,
                        timeWindow: Number.parseInt(e.target.value) || 5,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="question-id">Question ID (e.g., q2091)</Label>
                <Input
                  id="question-id"
                  value={currentRule.params.questionId}
                  onChange={(e) =>
                    setCurrentRule({
                      ...currentRule,
                      params: {
                        ...currentRule.params,
                        questionId: e.target.value,
                      },
                    })
                  }
                  placeholder="Enter question ID"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="use-join-param"
                  checked={currentRule.params.useJoinParam}
                  onCheckedChange={(checked) =>
                    setCurrentRule({
                      ...currentRule,
                      params: {
                        ...currentRule.params,
                        useJoinParam: checked,
                      },
                    })
                  }
                />
                <Label htmlFor="use-join-param">Filter by emote value</Label>
              </div>

              {currentRule.params.useJoinParam && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="operator">Operator</Label>
                    <Select
                      value={currentRule.params.operator}
                      onValueChange={(value) =>
                        setCurrentRule({
                          ...currentRule,
                          params: {
                            ...currentRule.params,
                            operator: value,
                          },
                        })
                      }
                    >
                      <SelectTrigger id="operator">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="emote-value">Emote Value (-2 to 2)</Label>
                    <Input
                      id="emote-value"
                      type="number"
                      min="-2"
                      max="2"
                      value={currentRule.params.value}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          params: {
                            ...currentRule.params,
                            value: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Action Configuration</h3>

              <div>
                <Label htmlFor="action-type">Action Type</Label>
                <Select
                  value={currentRule.action.type}
                  onValueChange={(value: "email" | "sms" | "incident") =>
                    setCurrentRule({
                      ...currentRule,
                      action: {
                        type: value,
                        data: {
                          validityPeriod: "5",
                        },
                      },
                    })
                  }
                >
                  <SelectTrigger id="action-type">
                    <SelectValue placeholder="Select action type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="incident">Incident (Ticket)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email Action Fields */}
              {currentRule.action.type === "email" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-to">Email Recipients (comma separated)</Label>
                    <Input
                      id="email-to"
                      value={currentRule.action.data.to || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              to: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="email-template">Full Email Template (Subject + Body)</Label>
                    </div>
                    <Select onValueChange={applyEmailTemplate}>
                      <SelectTrigger id="email-template">
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      value={currentRule.action.data.subject || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              subject: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Alert: Customer Feedback"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="email-body-template">Email Body Template</Label>
                    </div>
                    <Select onValueChange={applyEmailBodyTemplate}>
                      <SelectTrigger id="email-body-template">
                        <SelectValue placeholder="Select a body template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailBodyTemplates.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Remember to replace placeholder IDs in the email body with your actual values (q2091, gp3700,
                      etc.)
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="email-body">Email Body (HTML)</Label>
                    <Textarea
                      id="email-body"
                      value={currentRule.action.data.body || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              body: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="<p>Hello,</p><p>A customer has provided feedback.</p><p>Customer: $$loyalty_Name_value$$<br>Rating: $$q2091_emote$$</p>"
                      className="min-h-[200px] font-mono"
                    />
                  </div>
                </div>
              )}

              {/* SMS Action Fields */}
              {currentRule.action.type === "sms" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sms-to">SMS Recipients (comma separated)</Label>
                    <Input
                      id="sms-to"
                      value={currentRule.action.data.smsTo || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              smsTo: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="+94771234567, +94771234568"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="sms-template">Full SMS Template</Label>
                    </div>
                    <Select onValueChange={applySmsTemplate}>
                      <SelectTrigger id="sms-template">
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {smsTemplates.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="sms-body-template">SMS Body Template</Label>
                    </div>
                    <Select onValueChange={applySmsBodyTemplate}>
                      <SelectTrigger id="sms-body-template">
                        <SelectValue placeholder="Select a body template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {smsBodyTemplates.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Remember to replace placeholder IDs in the SMS body with your actual values (q2091, gp3700, etc.)
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="sms-body">SMS Body</Label>
                    <Textarea
                      id="sms-body"
                      value={currentRule.action.data.smsbody || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              smsbody: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Alert: Customer $$loyalty_Name_value$$ has provided feedback. Rating: $$q2091_emote$$"
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {/* Incident Action Fields */}
              {currentRule.action.type === "incident" && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workflow-id">Workflow ID</Label>
                    <Input
                      id="workflow-id"
                      value={currentRule.action.data.workflowID || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              workflowID: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="67986eb87d8a34b2b19dc613"
                    />
                  </div>

                  <div>
                    <Label htmlFor="incident-name">Incident Name</Label>
                    <Input
                      id="incident-name"
                      value={currentRule.action.data.name || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              name: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Customer Satisfaction Survey Complaint > $$emoSignature_Location_value$$"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="assignee">Assignee</Label>
                      <Input
                        id="assignee"
                        value={currentRule.action.data.assignee || ""}
                        onChange={(e) =>
                          setCurrentRule({
                            ...currentRule,
                            action: {
                              ...currentRule.action,
                              data: {
                                ...currentRule.action.data,
                                assignee: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="defaultassignee@emojot.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="incident-type">Incident Type</Label>
                      <Input
                        id="incident-type"
                        value={currentRule.action.data.type || ""}
                        onChange={(e) =>
                          setCurrentRule({
                            ...currentRule,
                            action: {
                              ...currentRule.action,
                              data: {
                                ...currentRule.action.data,
                                type: e.target.value,
                              },
                            },
                          })
                        }
                        placeholder="Customer Satisfaction Survey"
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={currentRule.action.data.priority || "Medium"}
                        onValueChange={(value) =>
                          setCurrentRule({
                            ...currentRule,
                            action: {
                              ...currentRule.action,
                              data: {
                                ...currentRule.action.data,
                                priority: value,
                              },
                            },
                          })
                        }
                      >
                        <SelectTrigger id="priority">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={currentRule.action.data.status || "Open"}
                      onValueChange={(value) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              status: value,
                            },
                          },
                        })
                      }
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="description-template">Description Template</Label>
                    </div>
                    <Select onValueChange={applyDescriptionTemplate}>
                      <SelectTrigger id="description-template">
                        <SelectValue placeholder="Select a template (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {incidentDescriptions.map((template) => (
                          <SelectItem key={template.name} value={template.name}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Remember to replace placeholder IDs in the description with your actual values (q2091, gp3700,
                      etc.)
                    </AlertDescription>
                  </Alert>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={currentRule.action.data.description || ""}
                      onChange={(e) =>
                        setCurrentRule({
                          ...currentRule,
                          action: {
                            ...currentRule.action,
                            data: {
                              ...currentRule.action.data,
                              description: e.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Customer Name: $$loyalty_Name_value$$
Customer Email: $$loyalty_Email_value$$
Customer Telephone: $$loyalty_Telephone_value$$
Customer Satisfaction: $$q2091_emote$$"
                      className="min-h-[100px] font-mono"
                    />
                  </div>

                  {/* Custom Fields */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Custom Fields</Label>
                      <Button variant="outline" size="sm" onClick={addCustomField} className="flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Add Field
                      </Button>
                    </div>

                    {currentRule.action.data.customFields?.map((field, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={field.key}
                          onChange={(e) => updateCustomField(index, "key", e.target.value)}
                          placeholder="Field key (e.g., location)"
                          className="flex-1"
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => updateCustomField(index, "value", e.target.value)}
                          placeholder="Field value (e.g., $$emoSignature_Location_value$$)"
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeCustomField(index)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Add Rule Button */}
            <Button onClick={addRule} className="w-full">
              Add Rule
            </Button>

            {/* Rules List */}
            {rules.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Added Rules</h3>
                <Accordion type="single" collapsible className="w-full">
                  {rules.map((rule, index) => (
                    <AccordionItem key={index} value={`rule-${index}`}>
                      <AccordionTrigger>
                        Rule {rule.id}: {rule.action.type} action for question {rule.params.questionId}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 p-2 bg-muted/50 rounded-md">
                          <p>
                            <strong>Question ID:</strong> {rule.params.questionId}
                          </p>
                          {rule.params.useJoinParam && (
                            <p>
                              <strong>Condition:</strong> emoteNumericValue {rule.params.operator} {rule.params.value}
                            </p>
                          )}
                          <p>
                            <strong>Action Type:</strong> {rule.action.type}
                          </p>

                          {rule.action.type === "email" && (
                            <>
                              <p>
                                <strong>To:</strong> {rule.action.data.to}
                              </p>
                              <p>
                                <strong>Subject:</strong> {rule.action.data.subject}
                              </p>
                            </>
                          )}

                          {rule.action.type === "sms" && (
                            <p>
                              <strong>To:</strong> {rule.action.data.smsTo}
                            </p>
                          )}

                          {rule.action.type === "incident" && (
                            <>
                              <p>
                                <strong>Workflow ID:</strong> {rule.action.data.workflowID}
                              </p>
                              <p>
                                <strong>Priority:</strong> {rule.action.data.priority}
                              </p>
                              <p>
                                <strong>Status:</strong> {rule.action.data.status || "Open"}
                              </p>
                            </>
                          )}

                          <Button variant="destructive" size="sm" onClick={() => removeRule(index)} className="mt-2">
                            Remove Rule
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </TabsContent>

          <TabsContent value="xml-preview">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">XML Preview</h3>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={copyXmlToClipboard} className="flex items-center gap-1">
                    <Copy className="h-4 w-4" /> Copy XML
                  </Button>
                  <Button size="sm" onClick={downloadXml} className="flex items-center gap-1">
                    <Download className="h-4 w-4" /> Download XML
                  </Button>
                </div>
              </div>

              {rules.length > 0 ? (
                <pre className="p-4 bg-muted rounded-md overflow-auto max-h-[600px] text-sm font-mono whitespace-pre">
                  {xmlPreview}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-muted rounded-md">
                  <FileCode className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No rules added yet. Add rules in the Rule Editor tab.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
