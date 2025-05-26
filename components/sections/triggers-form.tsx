"use client"

import type React from "react"
import { useState, useEffect, useCallback, useMemo } from "react"
import type { Workflow, Trigger } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X, AlertCircle, Check, Mail, MessageSquare } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface TriggersFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

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

// Get workflow creation triggers based on workflow type
const getWorkflowCreationTriggersByType = (workflowType: string, workflowName = "Customer Satisfaction Survey") => {
  const camelCaseWorkflowName = convertToCamelCase(workflowName)

  const baseTriggers = [
    {
      id: "creation_email",
      channel: "email" as const,
      template: "complaintCreationAlert_email",
      target: "admin" as const,
      contactFilters: ["ticketCreationAlert"],
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
    {
      id: "creation_sms",
      channel: "sms" as const,
      template: "complaintCreationAlert_sms",
      target: "admin" as const,
      contactFilters: ["ticketCreationAlert"],
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
    {
      id: "resolution_email",
      channel: "email" as const,
      template: "complaintResolutionAlert_email",
      target: "admin" as const,
      condition: { "==": [{ var: "status" }, "Resolved"] },
      contactFilters: ["ticketResolutionAlert"],
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
    {
      id: "resolution_sms",
      channel: "sms" as const,
      template: "complaintResolutionAlert_sms",
      target: "admin" as const,
      condition: { "==": [{ var: "status" }, "Resolved"] },
      contactFilters: ["ticketResolutionAlert"],
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
  ]

  switch (workflowType) {
    case "ccm":
      return baseTriggers
    case "orm":
      return baseTriggers.map((trigger) => ({
        ...trigger,
        template: trigger.template
          .replace("complaintCreationAlert_email", "complaintCreationAlert_orm_email")
          .replace("complaintCreationAlert_sms", "complaintCreationAlert_orm_sms")
          .replace("complaintResolutionAlert_email", "complaintResolutionAlert_orm_email")
          .replace("complaintResolutionAlert_sms", "complaintResolutionAlert_orm_sms"),
      }))
    case "combined":
      const ccmTriggers = baseTriggers.map((trigger) => ({
        ...trigger,
        id: `${trigger.id}_ccm`,
        condition: trigger.condition
          ? {
              and: [
                trigger.condition,
                {
                  "==": [
                    {
                      var: "type",
                    },
                    camelCaseWorkflowName,
                  ],
                },
              ],
            }
          : {
              "==": [
                {
                  var: "type",
                },
                camelCaseWorkflowName,
              ],
            },
      }))

      const ormTriggers = baseTriggers.map((trigger) => ({
        ...trigger,
        id: `${trigger.id}_orm`,
        template: trigger.template
          .replace("complaintCreationAlert_email", "complaintCreationAlert_orm_email")
          .replace("complaintCreationAlert_sms", "complaintCreationAlert_orm_sms")
          .replace("complaintResolutionAlert_email", "complaintResolutionAlert_orm_email")
          .replace("complaintResolutionAlert_sms", "complaintResolutionAlert_orm_sms"),
        condition: trigger.condition
          ? {
              and: [
                trigger.condition,
                {
                  "!=": [
                    {
                      var: "type",
                    },
                    camelCaseWorkflowName,
                  ],
                },
              ],
            }
          : {
              "!=": [
                {
                  var: "type",
                },
                camelCaseWorkflowName,
              ],
            },
      }))

      return [...ccmTriggers, ...ormTriggers]
    default:
      return baseTriggers
  }
}

const TriggersForm: React.FC<TriggersFormProps> = ({ workflow, setWorkflow }) => {
  const [newTriggerChannel, setNewTriggerChannel] = useState<string>("email")
  const [newTriggerTemplate, setNewTriggerTemplate] = useState<string>("")
  const [newTriggerTarget, setNewTriggerTarget] = useState<string>("admin")
  const [newTriggerContacts, setNewTriggerContacts] = useState<string>("")
  const [filterByLocation, setFilterByLocation] = useState<boolean>(true)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState<boolean>(false)
  const [triggerConditionType, setTriggerConditionType] = useState<string>("none")
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [selectedField, setSelectedField] = useState<string>("")
  const [fieldComparisonType, setFieldComparisonType] = useState<string>("equals")
  const [fieldComparisonValue, setFieldComparisonValue] = useState<string>("")
  const [enabledTriggers, setEnabledTriggers] = useState<Set<string>>(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  // Memoize available triggers to prevent recalculation
  const availableTriggers = useMemo(() => {
    return getWorkflowCreationTriggersByType(
      workflow.workflowType || "ccm",
      workflow.workflowName || "Customer Satisfaction Survey",
    )
  }, [workflow.workflowType, workflow.workflowName])

  // Initialize enabled triggers from existing workflow data or set defaults
  useEffect(() => {
    if (!availableTriggers.length) return

    // Check if we already have triggers in the workflow
    const existingTriggers = workflow.workflowCreation?.triggers || []

    if (existingTriggers.length > 0) {
      // If we have existing triggers, match them with available triggers
      const newEnabledTriggers = new Set<string>()

      availableTriggers.forEach((availableTrigger) => {
        const matchingTrigger = existingTriggers.find(
          (existing) =>
            existing.template === availableTrigger.template &&
            existing.channel === availableTrigger.channel &&
            existing.target === availableTrigger.target,
        )

        if (matchingTrigger) {
          newEnabledTriggers.add(availableTrigger.id)
        }
      })

      setEnabledTriggers(newEnabledTriggers)
    } else {
      // If no existing triggers, set defaults
      const newEnabledTriggers = new Set<string>()
      // By default, enable creation email and resolution email
      availableTriggers.forEach((trigger) => {
        if (trigger.id.includes("email")) {
          newEnabledTriggers.add(trigger.id)
        }
      })
      setEnabledTriggers(newEnabledTriggers)

      // Set initial workflow triggers
      const enabledTriggersList = availableTriggers
        .filter((trigger) => trigger.id.includes("email"))
        .map((trigger) => {
          const { id, ...triggerWithoutId } = trigger
          return triggerWithoutId
        })

      setWorkflow((prev) => ({
        ...prev,
        workflowCreation: {
          email: "bot@emojot.com",
          triggers: enabledTriggersList,
        },
      }))
    }

    setIsInitialized(true)
  }, [workflow.workflowType, workflow.workflowName]) // Only depend on workflow type and name

  const toggleTrigger = useCallback(
    (triggerId: string) => {
      setEnabledTriggers((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(triggerId)) {
          newSet.delete(triggerId)
        } else {
          newSet.add(triggerId)
        }

        // Directly update workflow here
        const enabledTriggersList = availableTriggers
          .filter((trigger) => newSet.has(trigger.id))
          .map((trigger) => {
            const { id, ...triggerWithoutId } = trigger
            return triggerWithoutId
          })

        setWorkflow((prevWorkflow) => {
          const updatedWorkflow = {
            ...prevWorkflow,
            workflowCreation: {
              email: "bot@emojot.com",
              triggers: enabledTriggersList,
            },
          }

          // Handle resolution triggers - add them to Resolved status
          const resolutionTriggers = enabledTriggersList.filter(
            (trigger) =>
              trigger.template?.includes("Resolution") ||
              trigger.template?.includes("resolution") ||
              trigger.template === "complaintResolutionAlert_email" ||
              trigger.template === "complaintResolutionAlert_sms" ||
              trigger.template === "complaintResolutionAlert_orm_email" ||
              trigger.template === "complaintResolutionAlert_orm_sms",
          )

          // Update statusFlow to include resolution triggers in Resolved status
          if (updatedWorkflow.statusFlow && updatedWorkflow.statusFlow.statuses) {
            updatedWorkflow.statusFlow.statuses = updatedWorkflow.statusFlow.statuses.map((status: any) => {
              if (status.id === "Resolved") {
                if (resolutionTriggers.length > 0) {
                  // Clean up triggers for the status (remove status conditions and clean template names)
                  const cleanedTriggers = resolutionTriggers.map((trigger) => {
                    const cleanTrigger = { ...trigger }

                    // Remove status condition since it's implied
                    if (
                      cleanTrigger.condition &&
                      cleanTrigger.condition["=="] &&
                      cleanTrigger.condition["=="][1] === "Resolved"
                    ) {
                      delete cleanTrigger.condition
                    }

                    // Handle complex conditions
                    if (cleanTrigger.condition && cleanTrigger.condition.and) {
                      cleanTrigger.condition.and = cleanTrigger.condition.and.filter(
                        (cond: any) => !(cond["=="] && cond["=="][1] === "Resolved"),
                      )
                      if (cleanTrigger.condition.and.length === 1) {
                        cleanTrigger.condition = cleanTrigger.condition.and[0]
                      } else if (cleanTrigger.condition.and.length === 0) {
                        delete cleanTrigger.condition
                      }
                    }

                    // Clean template name
                    // if (cleanTrigger.template) {
                    //   cleanTrigger.template = cleanTrigger.template.replace("_email", "").replace("_sms", "")
                    // }

                    return cleanTrigger
                  })

                  return { ...status, triggers: cleanedTriggers }
                } else {
                  // Remove triggers if no resolution triggers are selected
                  const { triggers, ...statusWithoutTriggers } = status
                  return statusWithoutTriggers
                }
              }
              return status
            })
          }

          return updatedWorkflow
        })

        return newSet
      })
    },
    [availableTriggers, setWorkflow],
  )

  const addCustomTrigger = () => {
    if (!newTriggerTemplate.trim()) {
      alert("Template name is required!")
      return
    }

    const newTrigger: Trigger = {
      channel: newTriggerChannel as any,
      template: newTriggerTemplate,
      target: newTriggerTarget as any,
    }

    // Add contacts if provided
    if (newTriggerContacts.trim()) {
      newTrigger.contacts = newTriggerContacts.split(",").map((c) => c.trim())
    }

    // Add admin user query if filter by location is enabled
    if (filterByLocation && newTriggerTarget === "admin") {
      newTrigger.adminUserQuery = {
        condition: "and",
        rules: [
          {
            field: "location",
            operator: "eq",
            value: "$location$",
          },
        ],
      }
    }

    // Add condition based on user selection
    if (triggerConditionType === "status" && selectedStatus) {
      newTrigger.condition = { "==": [{ var: "status" }, selectedStatus] }
    } else if (triggerConditionType === "field" && selectedField && fieldComparisonValue) {
      if (fieldComparisonType === "equals") {
        newTrigger.condition = { "==": [{ var: selectedField }, fieldComparisonValue] }
      } else if (fieldComparisonType === "notEquals") {
        newTrigger.condition = { "!=": [{ var: selectedField }, fieldComparisonValue] }
      } else if (fieldComparisonType === "contains") {
        newTrigger.condition = { in: [fieldComparisonValue, { var: selectedField }] }
      }
    }

    // Add to workflow creation triggers
    setWorkflow((prev) => ({
      ...prev,
      workflowCreation: {
        ...prev.workflowCreation,
        email: prev.workflowCreation?.email || "bot@emojot.com",
        triggers: [...(prev.workflowCreation?.triggers || []), newTrigger],
      },
    }))

    // Reset form
    setNewTriggerTemplate("")
    setNewTriggerContacts("")
    setFilterByLocation(true)
    setTriggerConditionType("none")
    setSelectedStatus("")
    setSelectedField("")
    setFieldComparisonType("equals")
    setFieldComparisonValue("")
  }

  const removeCustomTrigger = (index: number) => {
    if (workflow.workflowCreation && workflow.workflowCreation.triggers) {
      const customTriggersStartIndex = availableTriggers.filter((t) => enabledTriggers.has(t.id)).length
      const actualIndex = customTriggersStartIndex + index

      setWorkflow((prev) => ({
        ...prev,
        workflowCreation: {
          ...prev.workflowCreation,
          triggers: prev.workflowCreation.triggers.filter((_, i) => i !== actualIndex),
        },
      }))
    }
  }

  // Get field options from workflow custom fields
  const fieldOptions = useMemo(() => {
    return Object.entries(workflow.customFields || {}).map(([id, field]) => ({
      id,
      name: field.name,
    }))
  }, [workflow.customFields])

  // Get status options from workflow status values
  const statusOptions = useMemo(() => {
    return (
      workflow.statusFlow?.statuses?.map((status) => ({
        id: status.id,
        name: status.name,
      })) || []
    )
  }, [workflow.statusFlow?.statuses])

  // Helper function to display condition in human-readable format
  const formatCondition = (trigger: Trigger) => {
    if (!trigger.condition) return "Always"

    // Check for complex conditions (combined workflows)
    if (trigger.condition.and) {
      return "Complex condition"
    }

    // Check for status condition
    if (trigger.condition["=="] && trigger.condition["=="][0]?.var === "status") {
      const statusValue = trigger.condition["=="][1]
      return `When status is "${statusValue}"`
    }

    // Check for type condition
    if (trigger.condition["=="] && trigger.condition["=="][0]?.var === "type") {
      const typeValue = trigger.condition["=="][1]
      return `When type is "${typeValue}"`
    }

    if (trigger.condition["!="] && trigger.condition["!="][0]?.var === "type") {
      const typeValue = trigger.condition["!="][1]
      return `When type is not "${typeValue}"`
    }

    return "Custom condition"
  }

  // Get custom triggers (those not in the predefined list)
  const customTriggers = useMemo(() => {
    return (workflow.workflowCreation?.triggers || []).slice(
      availableTriggers.filter((t) => enabledTriggers.has(t.id)).length,
    )
  }, [workflow.workflowCreation?.triggers, availableTriggers, enabledTriggers])

  if (!isInitialized) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Creation & Resolution Triggers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Predefined Triggers Available</AlertTitle>
            <AlertDescription>
              Based on your workflow type ({workflow.workflowType?.toUpperCase() || "CCM"}), creation and resolution
              triggers are available. Select which ones to enable.
            </AlertDescription>
          </Alert>

          {/* Predefined Triggers */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Available Triggers</h3>
            <div className="grid gap-4">
              {availableTriggers.map((trigger) => (
                <div key={trigger.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={trigger.id}
                    checked={enabledTriggers.has(trigger.id)}
                    onCheckedChange={() => toggleTrigger(trigger.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      {trigger.channel === "email" ? (
                        <Mail className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      )}
                      <Label htmlFor={trigger.id} className="cursor-pointer font-medium">
                        {trigger.template}
                      </Label>
                      <Badge variant="outline" className="text-xs">
                        {trigger.channel.toUpperCase()}
                      </Badge>
                      {trigger.condition && (
                        <Badge variant="secondary" className="text-xs">
                          Conditional
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Target: {trigger.target} • Condition: {formatCondition(trigger)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Triggers Summary */}
          {enabledTriggers.size > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Active Triggers Summary</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableTriggers
                    .filter((trigger) => enabledTriggers.has(trigger.id))
                    .map((trigger, index) => (
                      <TableRow key={trigger.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {trigger.channel === "email" ? (
                              <Mail className="h-4 w-4 text-blue-500" />
                            ) : (
                              <MessageSquare className="h-4 w-4 text-green-500" />
                            )}
                            <span>{trigger.channel}</span>
                          </div>
                        </TableCell>
                        <TableCell>{trigger.template}</TableCell>
                        <TableCell>
                          {trigger.target}
                          {trigger.target === "admin" && (
                            <div className="text-xs text-muted-foreground flex items-center mt-1">
                              <Check className="h-3 w-3 mr-1" />
                              Filtered by location
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{formatCondition(trigger)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Custom Trigger Addition */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Add Custom Trigger</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="triggerChannel">Trigger Channel</Label>
                  <TooltipHelper content="The communication channel for this trigger." />
                </div>
                <Select value={newTriggerChannel} onValueChange={setNewTriggerChannel}>
                  <SelectTrigger id="triggerChannel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="fieldChange">Field Change</SelectItem>
                    <SelectItem value="fieldChangeRevert">Field Change Revert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="triggerTemplate">Template Name</Label>
                  <TooltipHelper content="The name of the template to use for this trigger." />
                </div>
                <Input
                  id="triggerTemplate"
                  value={newTriggerTemplate}
                  onChange={(e) => setNewTriggerTemplate(e.target.value)}
                  placeholder="e.g., customAlert"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="triggerTarget">Target</Label>
                  <TooltipHelper content="Who should receive this notification." />
                </div>
                <Select value={newTriggerTarget} onValueChange={setNewTriggerTarget}>
                  <SelectTrigger id="triggerTarget">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center">
                  <Label htmlFor="triggerContacts">Contacts (comma separated)</Label>
                  <TooltipHelper content="Specific contacts to receive this notification." />
                </div>
                <Input
                  id="triggerContacts"
                  value={newTriggerContacts}
                  onChange={(e) => setNewTriggerContacts(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                />
              </div>
            </div>

            {newTriggerTarget === "admin" && (
              <div className="flex items-center space-x-2 mt-4">
                <Checkbox
                  id="filterByLocation"
                  checked={filterByLocation}
                  onCheckedChange={(checked) => setFilterByLocation(checked as boolean)}
                />
                <Label htmlFor="filterByLocation" className="cursor-pointer">
                  Filter admins by location (recommended)
                </Label>
                <TooltipHelper content="This will send notifications only to admins responsible for the specific location." />
              </div>
            )}

            <Button onClick={addCustomTrigger} className="w-full mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Trigger
            </Button>
          </div>

          {/* Custom Triggers List */}
          {customTriggers.length > 0 && (
            <div className="space-y-2">
              <Label>Custom Triggers</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customTriggers.map((trigger, index) => (
                    <TableRow key={index}>
                      <TableCell>{trigger.channel}</TableCell>
                      <TableCell>
                        {trigger.template}
                        <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Custom</span>
                      </TableCell>
                      <TableCell>
                        {trigger.target}
                        {trigger.target === "admin" && trigger.adminUserQuery && (
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Check className="h-3 w-3 mr-1" />
                            Filtered by location
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatCondition(trigger)}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => removeCustomTrigger(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TriggersForm
