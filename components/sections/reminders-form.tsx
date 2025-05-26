"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TooltipHelper from "@/components/ui/tooltip-helper"
import { TooltipProvider } from "@/components/ui/tooltip"

interface RemindersFormProps {
  workflow: any
  setWorkflow: React.Dispatch<React.SetStateAction<any>>
}

const RemindersForm: React.FC<RemindersFormProps> = ({ workflow, setWorkflow }) => {
  const [newReminderName, setNewReminderName] = useState<string>("")
  const [newReminderTemplate, setNewReminderTemplate] = useState<string>("")
  const [newReminderInterval, setNewReminderInterval] = useState<number>(24) // hours
  const [newReminderEnabled, setNewReminderEnabled] = useState<boolean>(true)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [reminderRecipient, setReminderRecipient] = useState<string>("assignee")

  // Initialize reminders if they don't exist
  if (!workflow.reminders) {
    setWorkflow({
      ...workflow,
      reminders: {
        enabled: true,
        templates: [],
        statuses: [],
        recipient: "assignee",
      },
    })
  }

  // Add a new reminder
  const addReminder = () => {
    if (!newReminderName.trim() || !newReminderTemplate.trim()) {
      alert("Reminder name and template are required!")
      return
    }

    const newReminder = {
      name: newReminderName,
      template: newReminderTemplate,
      interval: newReminderInterval * 3600000, // Convert hours to milliseconds
      enabled: newReminderEnabled,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      recipient: reminderRecipient || "assignee",
    }

    setWorkflow({
      ...workflow,
      reminders: {
        ...workflow.reminders,
        templates: [...(workflow.reminders?.templates || []), newReminder],
      },
    })

    // Reset form
    setNewReminderName("")
    setNewReminderTemplate("")
    setNewReminderInterval(24)
    setNewReminderEnabled(true)
    setSelectedStatuses([])
    setReminderRecipient("assignee")
  }

  // Remove a reminder
  const removeReminder = (index: number) => {
    const updatedTemplates = [...(workflow.reminders?.templates || [])]
    updatedTemplates.splice(index, 1)

    setWorkflow({
      ...workflow,
      reminders: {
        ...workflow.reminders,
        templates: updatedTemplates,
      },
    })
  }

  // Toggle reminders enabled
  const toggleRemindersEnabled = () => {
    setWorkflow({
      ...workflow,
      reminders: {
        ...workflow.reminders,
        enabled: !workflow.reminders?.enabled,
      },
    })
  }

  // Toggle status selection for reminders
  const toggleStatusSelection = (statusId: string) => {
    if (selectedStatuses.includes(statusId)) {
      setSelectedStatuses(selectedStatuses.filter((id) => id !== statusId))
    } else {
      setSelectedStatuses([...selectedStatuses, statusId])
    }
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Reminders Configuration</span>
            <div className="flex items-center space-x-2">
              <Switch
                id="reminders-enabled"
                checked={workflow.reminders?.enabled}
                onCheckedChange={toggleRemindersEnabled}
              />
              <Label htmlFor="reminders-enabled">Enabled</Label>
            </div>
          </CardTitle>
          <CardDescription>Configure automated reminders for tickets that haven't been updated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add New Reminder</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder-name">
                    Reminder Name
                    <TooltipHelper content="A descriptive name for this reminder" />
                  </Label>
                  <Input
                    id="reminder-name"
                    value={newReminderName}
                    onChange={(e) => setNewReminderName(e.target.value)}
                    placeholder="Daily Reminder"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-template">
                    Email Template
                    <TooltipHelper content="The email template to use for this reminder" />
                  </Label>
                  <Input
                    id="reminder-template"
                    value={newReminderTemplate}
                    onChange={(e) => setNewReminderTemplate(e.target.value)}
                    placeholder="ticketReminderTemplate"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reminder-interval">
                    Interval (hours)
                    <TooltipHelper content="How often to send this reminder" />
                  </Label>
                  <Input
                    id="reminder-interval"
                    type="number"
                    min={1}
                    value={newReminderInterval}
                    onChange={(e) => setNewReminderInterval(Number.parseInt(e.target.value) || 24)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminder-recipient">
                    Recipients
                    <TooltipHelper content="Who should receive reminder emails" />
                  </Label>
                  <Select value={reminderRecipient} onValueChange={setReminderRecipient}>
                    <SelectTrigger id="reminder-recipient">
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assignee">Assignee</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>
                  Apply to Statuses
                  <TooltipHelper content="Which statuses should have reminders enabled" />
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-2 border rounded-md">
                  {workflow.statusFlow.statuses.map((status: any) => (
                    <div key={status.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`status-${status.id}`}
                        checked={selectedStatuses.includes(status.id)}
                        onChange={() => toggleStatusSelection(status.id)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`status-${status.id}`}>{status.name}</Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  If no statuses are selected, the reminder will apply to all non-final statuses.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="reminder-enabled"
                  checked={newReminderEnabled}
                  onCheckedChange={(checked) => setNewReminderEnabled(checked)}
                />
                <Label htmlFor="reminder-enabled">Enabled</Label>
              </div>

              <Button onClick={addReminder} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Reminder Templates</h3>

              {workflow.reminders?.templates && workflow.reminders.templates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Interval (hours)</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Enabled</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflow.reminders.templates.map((reminder: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{reminder.name}</TableCell>
                        <TableCell>{reminder.template}</TableCell>
                        <TableCell>{Math.round(reminder.interval / 3600000)}</TableCell>
                        <TableCell>{reminder.recipient || "assignee"}</TableCell>
                        <TableCell>{reminder.enabled ? "Yes" : "No"}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => removeReminder(index)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No reminder templates configured</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default RemindersForm
