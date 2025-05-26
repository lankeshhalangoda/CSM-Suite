"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash, Edit } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import TooltipHelper from "@/components/ui/tooltip-helper"
import { TooltipProvider } from "@/components/ui/tooltip"

interface SubTasksFormProps {
  workflow: any
  setWorkflow: React.Dispatch<React.SetStateAction<any>>
}

const SubTasksForm: React.FC<SubTasksFormProps> = ({ workflow, setWorkflow }) => {
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDescription, setNewTemplateDescription] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Initialize subtask if it doesn't exist
  if (!workflow.subTask) {
    workflow.subTask = {
      enabled: true,
      subtaskTemplates: [],
    }
  }

  // Add a new subtask template
  const addSubtaskTemplate = () => {
    if (!newTemplateName.trim()) {
      alert("Template name is required!")
      return
    }

    if (editingIndex !== null) {
      // Update existing template
      const updatedTemplates = [...workflow.subTask.subtaskTemplates]
      updatedTemplates[editingIndex] = {
        name: newTemplateName,
        description: newTemplateDescription,
      }

      setWorkflow({
        ...workflow,
        subTask: {
          ...workflow.subTask,
          subtaskTemplates: updatedTemplates,
        },
      })

      setEditingIndex(null)
    } else {
      // Add new template
      const newTemplate = {
        name: newTemplateName,
        description: newTemplateDescription,
      }

      setWorkflow({
        ...workflow,
        subTask: {
          ...workflow.subTask,
          subtaskTemplates: [...workflow.subTask.subtaskTemplates, newTemplate],
        },
      })
    }

    // Reset form
    setNewTemplateName("")
    setNewTemplateDescription("")
  }

  // Edit a subtask template
  const editSubtaskTemplate = (index: number) => {
    const template = workflow.subTask.subtaskTemplates[index]
    setNewTemplateName(template.name)
    setNewTemplateDescription(template.description || "")
    setEditingIndex(index)
  }

  // Remove a subtask template
  const removeSubtaskTemplate = (index: number) => {
    const updatedTemplates = [...workflow.subTask.subtaskTemplates]
    updatedTemplates.splice(index, 1)

    setWorkflow({
      ...workflow,
      subTask: {
        ...workflow.subTask,
        subtaskTemplates: updatedTemplates,
      },
    })
  }

  // Toggle subtasks enabled
  const toggleSubtasksEnabled = () => {
    setWorkflow({
      ...workflow,
      subTask: {
        ...workflow.subTask,
        enabled: !workflow.subTask.enabled,
      },
    })
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center justify-between">
            <span>Sub-Tasks Configuration</span>
            <div className="flex items-center space-x-2">
              <Switch
                id="subtasks-enabled"
                checked={workflow.subTask.enabled}
                onCheckedChange={toggleSubtasksEnabled}
              />
              <Label htmlFor="subtasks-enabled">Enabled</Label>
            </div>
          </CardTitle>
          <CardDescription>Configure sub-task templates for breaking down complex tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sub-Task Templates</h3>

              {workflow.subTask.subtaskTemplates && workflow.subTask.subtaskTemplates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflow.subTask.subtaskTemplates.map((template: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{template.name}</TableCell>
                        <TableCell>{template.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => editSubtaskTemplate(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => removeSubtaskTemplate(index)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-4 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No sub-task templates configured</p>
                </div>
              )}

              <div className="space-y-4 border p-4 rounded-md">
                <h4 className="font-medium">{editingIndex !== null ? "Edit Template" : "Add New Template"}</h4>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">
                      Template Name
                      <TooltipHelper content="A descriptive name for this sub-task template" />
                    </Label>
                    <Input
                      id="template-name"
                      value={newTemplateName}
                      onChange={(e) => setNewTemplateName(e.target.value)}
                      placeholder="Investigation"
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-description">
                      Description
                      <TooltipHelper content="A description of what this sub-task involves" />
                    </Label>
                    <Textarea
                      id="template-description"
                      value={newTemplateDescription}
                      onChange={(e) => setNewTemplateDescription(e.target.value)}
                      placeholder="Investigate the root cause of the issue"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingIndex !== null && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingIndex(null)
                          setNewTemplateName("")
                          setNewTemplateDescription("")
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button onClick={addSubtaskTemplate}>
                      {editingIndex !== null ? "Update Template" : "Add Template"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sub-Task Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="auto-complete" />
                  <Label htmlFor="auto-complete">Auto-complete parent when all sub-tasks are complete</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="inherit-assignee" />
                  <Label htmlFor="inherit-assignee">Sub-tasks inherit parent assignee by default</Label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default SubTasksForm
