"use client"

import type React from "react"
import { useState } from "react"
import type { Workflow, EnumValue } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Edit, Check } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"

interface PriorityConfigFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const PriorityConfigForm: React.FC<PriorityConfigFormProps> = ({ workflow, setWorkflow }) => {
  const [priorityName, setPriorityName] = useState<string>(workflow.priority.name)
  const [priorityReadOnly, setPriorityReadOnly] = useState<boolean>(workflow.priority.readOnly || false)
  const [newPriorityValue, setNewPriorityValue] = useState<string>("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const handlePriorityNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriorityName(e.target.value)
  }

  const savePriorityName = () => {
    setWorkflow((prev) => ({
      ...prev,
      priority: {
        ...prev.priority,
        name: priorityName,
        readOnly: priorityReadOnly,
      },
    }))
  }

  const addPriorityValue = () => {
    if (!newPriorityValue.trim()) return

    // Make ID and name exactly the same
    const priorityId = newPriorityValue
    const priorityName = newPriorityValue

    // Check if option already exists
    if (workflow.priority.values.some((v) => v.id === priorityId)) {
      alert("This priority value already exists!")
      return
    }

    const newValue: EnumValue = {
      id: priorityId,
      name: priorityName,
    }

    setWorkflow((prev) => ({
      ...prev,
      priority: {
        ...prev.priority,
        values: [...prev.priority.values, newValue],
      },
    }))

    setNewPriorityValue("")
  }

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditValue(workflow.priority.values[index].name)
  }

  const saveEditing = () => {
    if (editingIndex === null) return

    const updatedValues = [...workflow.priority.values]

    // Make ID and name exactly the same
    const priorityId = editValue
    const priorityName = editValue

    updatedValues[editingIndex] = {
      ...updatedValues[editingIndex],
      id: priorityId,
      name: priorityName,
    }

    setWorkflow((prev) => ({
      ...prev,
      priority: {
        ...prev.priority,
        values: updatedValues,
      },
    }))

    setEditingIndex(null)
    setEditValue("")
  }

  const deletePriorityValue = (index: number) => {
    const updatedValues = [...workflow.priority.values]
    updatedValues.splice(index, 1)

    setWorkflow((prev) => ({
      ...prev,
      priority: {
        ...prev.priority,
        values: updatedValues,
      },
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Priority Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="priorityName">Priority Field Name</Label>
              <TooltipHelper content="The label that will be displayed for the priority field." />
            </div>
            <div className="flex space-x-2">
              <Input id="priorityName" value={priorityName} onChange={handlePriorityNameChange} />
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="priorityReadOnly"
                  checked={priorityReadOnly}
                  onCheckedChange={(checked) => setPriorityReadOnly(checked as boolean)}
                />
                <Label htmlFor="priorityReadOnly">Read Only</Label>
              </div>
              <Button onClick={savePriorityName}>Save</Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label>Priority Values</Label>
              <TooltipHelper content="The available options for the priority field." />
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add new priority value"
                value={newPriorityValue}
                onChange={(e) => setNewPriorityValue(e.target.value)}
              />
              <Button onClick={addPriorityValue}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority Values List</Label>
            <div className="border rounded-md overflow-hidden">
              {workflow.priority.values.length > 0 ? (
                <ul className="divide-y">
                  {workflow.priority.values.map((value, index) => (
                    <li key={index} className="p-3">
                      {editingIndex === index ? (
                        <div className="space-y-4">
                          <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
                          <div className="flex justify-end space-x-2">
                            <Button onClick={() => setEditingIndex(null)} variant="outline">
                              Cancel
                            </Button>
                            <Button onClick={saveEditing}>
                              <Check className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{value.name}</span>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => startEditing(index)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deletePriorityValue(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-3 text-muted-foreground text-sm">No priority values configured.</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PriorityConfigForm
