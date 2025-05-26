"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Workflow } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Clock, Mail, MessageSquare } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AssignmentFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ workflow, setWorkflow }) => {
  const [isAutomaticAssignmentEnabled, setIsAutomaticAssignmentEnabled] = useState<boolean>(
    workflow.assignment?.automaticAssignment?.isEnabled || false,
  )

  // State to track which triggers are enabled
  const [enabledTriggers, setEnabledTriggers] = useState<Record<string, boolean>>({})

  // Helper function to generate trigger key
  const getTriggerKey = (trigger: any) => {
    return `${trigger.channel}_${trigger.template || "default"}_${trigger.condition ? JSON.stringify(trigger.condition) : "no_condition"}`
  }

  // Update assignment triggers based on workflow type
  useEffect(() => {
    const workflowType = workflow.workflowType || "ccm"
    const workflowName = workflow.workflowName || "Customer Satisfaction Survey"
    const camelCaseWorkflowName = workflowName
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
      .split(" ")
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join("")

    let assignmentTriggers: any[] = []

    switch (workflowType) {
      case "ccm":
        assignmentTriggers = [
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
        ]
        break
      case "orm":
        assignmentTriggers = [
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
        ]
        break
      case "combined":
        assignmentTriggers = [
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
        ]
        break
    }

    // Initialize enabled triggers state (all enabled by default)
    const newEnabledTriggers: Record<string, boolean> = {}
    assignmentTriggers.forEach((trigger) => {
      const key = getTriggerKey(trigger)
      newEnabledTriggers[key] = enabledTriggers[key] !== undefined ? enabledTriggers[key] : true
    })
    setEnabledTriggers(newEnabledTriggers)

    // Filter triggers based on enabled state
    const filteredTriggers = assignmentTriggers.filter((trigger) => {
      const key = getTriggerKey(trigger)
      return newEnabledTriggers[key] !== false
    })

    setWorkflow((prev) => ({
      ...prev,
      assignment: {
        triggers: filteredTriggers,
        ...(prev.assignment?.automaticAssignment && {
          automaticAssignment: prev.assignment.automaticAssignment,
        }),
      },
    }))
  }, [workflow.workflowType, workflow.workflowName, setWorkflow])

  // Update workflow when trigger enabled state changes
  useEffect(() => {
    const workflowType = workflow.workflowType || "ccm"
    const workflowName = workflow.workflowName || "Customer Satisfaction Survey"
    const camelCaseWorkflowName = workflowName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(" ")
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join("")

    let allTriggers: any[] = []

    switch (workflowType) {
      case "ccm":
        allTriggers = [
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
        ]
        break
      case "orm":
        allTriggers = [
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
        ]
        break
      case "combined":
        allTriggers = [
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
        ]
        break
    }

    // Filter triggers based on enabled state
    const enabledTriggersArray = allTriggers.filter((trigger) => {
      const key = getTriggerKey(trigger)
      return enabledTriggers[key] === true
    })

    setWorkflow((prev) => ({
      ...prev,
      assignment: {
        triggers: enabledTriggersArray,
        ...(prev.assignment?.automaticAssignment && {
          automaticAssignment: prev.assignment.automaticAssignment,
        }),
      },
    }))
  }, [enabledTriggers, workflow.workflowType, workflow.workflowName, setWorkflow])

  const toggleTrigger = (trigger: any, enabled: boolean) => {
    const key = getTriggerKey(trigger)
    setEnabledTriggers((prev) => ({
      ...prev,
      [key]: enabled,
    }))
  }

  const toggleAutomaticAssignment = (checked: boolean) => {
    setIsAutomaticAssignmentEnabled(checked)

    setWorkflow((prev) => {
      const currentTriggers = prev.assignment?.triggers || []

      if (checked) {
        return {
          ...prev,
          assignment: {
            ...prev.assignment,
            triggers: currentTriggers,
            automaticAssignment: {
              isEnabled: true,
              email: "bot@emojot.com",
              triggerFlows: [
                {
                  condition: { "!=": [{ var: "status" }, "Resolved"] },
                  levels: [
                    {
                      nextLevelTime: 86400000, // 24 hours
                      assignee: "admin@emojot.com",
                    },
                  ],
                },
              ],
            },
          },
        }
      } else {
        const { automaticAssignment, ...restAssignment } = prev.assignment || {}
        return {
          ...prev,
          assignment: {
            ...restAssignment,
            triggers: currentTriggers,
          },
        }
      }
    })
  }

  const updateAutomaticAssignmentEmail = (email: string) => {
    setWorkflow((prev) => ({
      ...prev,
      assignment: {
        ...prev.assignment,
        automaticAssignment: {
          ...prev.assignment?.automaticAssignment,
          isEnabled: isAutomaticAssignmentEnabled,
          email: email,
          triggerFlows: prev.assignment?.automaticAssignment?.triggerFlows || [],
        },
      },
    }))
  }

  const addEscalationLevel = () => {
    setWorkflow((prev) => {
      const currentFlows = prev.assignment?.automaticAssignment?.triggerFlows || []
      const firstFlow = currentFlows[0] || {
        condition: { "!=": [{ var: "status" }, "Resolved"] },
        levels: [],
      }

      const newLevel = {
        nextLevelTime: 3600000, // 1 hour
        assignee: "",
        fieldsChange: [],
      }

      const updatedFlow = {
        ...firstFlow,
        levels: [...(firstFlow.levels || []), newLevel],
      }

      return {
        ...prev,
        assignment: {
          ...prev.assignment,
          automaticAssignment: {
            ...prev.assignment?.automaticAssignment,
            isEnabled: isAutomaticAssignmentEnabled,
            email: prev.assignment?.automaticAssignment?.email || "bot@emojot.com",
            triggerFlows: [updatedFlow, ...currentFlows.slice(1)],
          },
        },
      }
    })
  }

  const removeEscalationLevel = (levelIndex: number) => {
    setWorkflow((prev) => {
      const currentFlows = prev.assignment?.automaticAssignment?.triggerFlows || []
      const firstFlow = currentFlows[0]

      if (!firstFlow) return prev

      const updatedFlow = {
        ...firstFlow,
        levels: firstFlow.levels?.filter((_, index) => index !== levelIndex) || [],
      }

      return {
        ...prev,
        assignment: {
          ...prev.assignment,
          automaticAssignment: {
            ...prev.assignment?.automaticAssignment,
            triggerFlows: [updatedFlow, ...currentFlows.slice(1)],
          },
        },
      }
    })
  }

  const updateEscalationLevel = (levelIndex: number, field: string, value: any) => {
    setWorkflow((prev) => {
      const currentFlows = prev.assignment?.automaticAssignment?.triggerFlows || []
      const firstFlow = currentFlows[0]

      if (!firstFlow) return prev

      const updatedLevels = firstFlow.levels?.map((level, index) => {
        if (index === levelIndex) {
          return { ...level, [field]: value }
        }
        return level
      })

      const updatedFlow = {
        ...firstFlow,
        levels: updatedLevels || [],
      }

      return {
        ...prev,
        assignment: {
          ...prev.assignment,
          automaticAssignment: {
            ...prev.assignment?.automaticAssignment,
            triggerFlows: [updatedFlow, ...currentFlows.slice(1)],
          },
        },
      }
    })
  }

  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000)
    const minutes = Math.floor((milliseconds % 3600000) / 60000)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const parseTimeToMilliseconds = (timeStr: string) => {
    const hoursMatch = timeStr.match(/(\d+)h/)
    const minutesMatch = timeStr.match(/(\d+)m/)
    const hours = hoursMatch ? Number.parseInt(hoursMatch[1]) : 0
    const minutes = minutesMatch ? Number.parseInt(minutesMatch[1]) : 0
    return hours * 3600000 + minutes * 60000
  }

  // Get all possible triggers for the current workflow type
  const getAllPossibleTriggers = () => {
    const workflowType = workflow.workflowType || "ccm"
    const workflowName = workflow.workflowName || "Customer Satisfaction Survey"
    const camelCaseWorkflowName = workflowName
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(" ")
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase()
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      })
      .join("")

    switch (workflowType) {
      case "ccm":
        return [
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
        ]
      case "orm":
        return [
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
        ]
      case "combined":
        return [
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
        ]
      default:
        return []
    }
  }

  const allPossibleTriggers = getAllPossibleTriggers()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assignment Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="triggers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="triggers">Assignment Triggers</TabsTrigger>
              <TabsTrigger value="automatic">Automatic Assignment</TabsTrigger>
            </TabsList>

            <TabsContent value="triggers" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label>Assignment Triggers for {workflow.workflowType?.toUpperCase() || "CCM"}</Label>
                  <TooltipHelper content="These triggers fire when a ticket is assigned to an employee. Use checkboxes to enable/disable specific triggers." />
                </div>

                <div className="space-y-3">
                  {allPossibleTriggers.map((trigger, index) => {
                    const triggerKey = getTriggerKey(trigger)
                    const isEnabled = enabledTriggers[triggerKey] !== false

                    return (
                      <div key={index} className="flex items-center space-x-3 p-3 border rounded-md">
                        <Checkbox
                          id={`trigger-${index}`}
                          checked={isEnabled}
                          onCheckedChange={(checked) => toggleTrigger(trigger, checked as boolean)}
                        />
                        <div className="flex items-center space-x-2 flex-1">
                          {trigger.channel === "email" ? (
                            <Mail className="h-4 w-4 text-blue-500" />
                          ) : (
                            <MessageSquare className="h-4 w-4 text-green-500" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium">
                              {trigger.channel.toUpperCase()} - {trigger.template}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Target: {trigger.target}
                              {trigger.condition && (
                                <span className="ml-2 font-mono text-xs bg-muted px-1 rounded">Conditional</span>
                              )}
                              {trigger.appendEditUrl && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">Edit URL</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {workflow.assignment?.triggers && workflow.assignment.triggers.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Active Triggers ({workflow.assignment.triggers.length})</h4>
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
                        {workflow.assignment.triggers.map((trigger, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{trigger.channel}</TableCell>
                            <TableCell>{trigger.template}</TableCell>
                            <TableCell>{trigger.target}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {trigger.condition ? JSON.stringify(trigger.condition) : "Always"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="p-4 bg-muted rounded-md">
                  <h4 className="font-medium mb-2">Workflow Type: {workflow.workflowType?.toUpperCase() || "CCM"}</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the checkboxes above to enable/disable specific assignment triggers:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>
                      • <strong>Email triggers:</strong> Send assignment notifications via email
                    </li>
                    <li>
                      • <strong>SMS triggers:</strong> Send assignment notifications via SMS
                    </li>
                    <li>
                      • <strong>Conditional triggers:</strong> Only fire when specific conditions are met
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automatic" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="automaticAssignment"
                    checked={isAutomaticAssignmentEnabled}
                    onCheckedChange={toggleAutomaticAssignment}
                  />
                  <Label htmlFor="automaticAssignment">Enable Automatic Assignment & Escalation</Label>
                  <TooltipHelper content="Automatically assign tickets and escalate them based on time intervals." />
                </div>

                {isAutomaticAssignmentEnabled && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="assignmentEmail">Assignment Bot Email</Label>
                        <TooltipHelper content="Email address that will be used for automatic assignments." />
                      </div>
                      <Input
                        id="assignmentEmail"
                        value={workflow.assignment?.automaticAssignment?.email || ""}
                        onChange={(e) => updateAutomaticAssignmentEmail(e.target.value)}
                        placeholder="bot@emojot.com"
                      />
                    </div>

                    <div className="border p-4 rounded-md space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Escalation Levels</h4>
                        <Button onClick={addEscalationLevel} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Level
                        </Button>
                      </div>

                      {workflow.assignment?.automaticAssignment?.triggerFlows?.[0]?.levels?.map((level, index) => (
                        <div key={index} className="border p-3 rounded-md space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Level {index + 1}
                            </h5>
                            <Button variant="ghost" size="sm" onClick={() => removeEscalationLevel(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Time to Next Level</Label>
                              <Input
                                value={formatTime(level.nextLevelTime || 0)}
                                onChange={(e) =>
                                  updateEscalationLevel(index, "nextLevelTime", parseTimeToMilliseconds(e.target.value))
                                }
                                placeholder="1h 30m"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Assignee (optional)</Label>
                              <Input
                                value={level.assignee || ""}
                                onChange={(e) => updateEscalationLevel(index, "assignee", e.target.value)}
                                placeholder="admin@emojot.com"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Field Changes (JSON)</Label>
                            <Textarea
                              value={JSON.stringify(level.fieldsChange || [], null, 2)}
                              onChange={(e) => {
                                try {
                                  const parsed = JSON.parse(e.target.value)
                                  updateEscalationLevel(index, "fieldsChange", parsed)
                                } catch (error) {
                                  // Invalid JSON, don't update
                                }
                              }}
                              placeholder='[{"id": "priority", "value": "High"}]'
                              className="font-mono text-xs"
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}

                      {(!workflow.assignment?.automaticAssignment?.triggerFlows?.[0]?.levels ||
                        workflow.assignment.automaticAssignment.triggerFlows[0].levels.length === 0) && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No escalation levels configured. Click "Add Level" to create escalation rules.
                        </p>
                      )}
                    </div>

                    <div className="p-4 bg-blue-50 rounded-md">
                      <h4 className="font-medium mb-2">How Automatic Assignment Works</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tickets are automatically monitored based on their status</li>
                        <li>• After specified time intervals, tickets escalate to the next level</li>
                        <li>• Each level can assign to a different person and change field values</li>
                        <li>• Common use: Escalate from support → supervisor → manager</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default AssignmentForm
