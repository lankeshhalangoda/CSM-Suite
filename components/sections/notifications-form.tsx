"use client"

import type React from "react"
import { useState } from "react"
import type { Workflow } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, HelpCircle } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NotificationsFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const NotificationsForm: React.FC<NotificationsFormProps> = ({ workflow, setWorkflow }) => {
  const [newEventName, setNewEventName] = useState<string>("")
  const [newTemplateName, setNewTemplateName] = useState<string>("")
  const [showPlaceholderHelp, setShowPlaceholderHelp] = useState<boolean>(false)

  const addNotificationTemplate = () => {
    if (!newEventName.trim() || !newTemplateName.trim()) {
      alert("Both event name and template name are required!")
      return
    }

    setWorkflow((prev) => ({
      ...prev,
      notificationTemplates: {
        ...(prev.notificationTemplates || {}),
        [newEventName]: newTemplateName,
      },
    }))

    // Reset form
    setNewEventName("")
    setNewTemplateName("")
  }

  const removeNotificationTemplate = (eventName: string) => {
    setWorkflow((prev) => {
      const updatedTemplates = { ...(prev.notificationTemplates || {}) }
      delete updatedTemplates[eventName]

      return {
        ...prev,
        notificationTemplates: updatedTemplates,
      }
    })
  }

  // Sample email placeholders for help dialog
  const emailPlaceholders = [
    { id: "incident_assigneeName", description: "Current assignee name" },
    { id: "incident_previousAssigneeName", description: "Previous assignee name" },
    { id: "incident_updatedByName", description: "Name of the person who updated the incident" },
    { id: "incident_id", description: "Unique identifier used by the system" },
    { id: "incident_number", description: "Human readable incident number (123)" },
    { id: "incident_created_date", description: "Incident created date" },
    { id: "incident_description", description: "Description of the incident" },
    { id: "incident_type", description: "Type of the incident" },
    { id: "incident_status", description: "Status of the incident" },
    { id: "incident_priority", description: "Priority of the incident" },
    { id: "client_name", description: "Name of the person who created the incident" },
    { id: "client_email", description: "Email of the person who created the incident" },
    { id: "client_telephone", description: "Telephone of the person who created the incident" },
    { id: "incident_newVal", description: "New value when someone changes a property" },
    { id: "incident_oldVal", description: "Old value when someone changes a property" },
    { id: "incident_name", description: "Name of the incident" },
    { id: "workflow_id", description: "Unique workflow identifier" },
    { id: "emoSignature_<key>", description: "Emo signature data (e.g., $emoSignature_Customer$)" },
    {
      id: "incident_customFields_<fieldId>",
      description: "Custom field value (e.g., $incident_customFields_supportType$)",
    },
    { id: "incident_lastComment", description: "Last comment of the incident" },
    { id: "incidentURL", description: "Append Edit URL to Incident" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Notification Templates</span>
            <Button variant="ghost" size="sm" onClick={() => setShowPlaceholderHelp(true)}>
              <HelpCircle className="h-4 w-4 mr-2" />
              Placeholder Help
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="eventName">Event Name</Label>
                <TooltipHelper content="The name of the event that triggers this notification." />
              </div>
              <Input
                id="eventName"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g., ticketCreation, statusChange"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="templateName">Template Name</Label>
                <TooltipHelper content="The name of the email template to use for this notification." />
              </div>
              <Input
                id="templateName"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., complaintCreationAlert"
              />
            </div>
          </div>

          <Button onClick={addNotificationTemplate} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Notification Template
          </Button>

          <div className="space-y-2">
            <Label>Current Notification Templates</Label>
            {workflow.notificationTemplates && Object.keys(workflow.notificationTemplates).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(workflow.notificationTemplates).map(([event, template]) => (
                    <TableRow key={event}>
                      <TableCell>{event}</TableCell>
                      <TableCell>{template}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => removeNotificationTemplate(event)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No notification templates configured yet.</p>
            )}
          </div>

          <Dialog open={showPlaceholderHelp} onOpenChange={setShowPlaceholderHelp}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Email Template Placeholders</DialogTitle>
                <DialogDescription>
                  Use these placeholders in your email templates to include dynamic content.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Placeholder</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {emailPlaceholders.map((placeholder) => (
                      <TableRow key={placeholder.id}>
                        <TableCell className="font-mono">${placeholder.id}$</TableCell>
                        <TableCell>{placeholder.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationsForm
