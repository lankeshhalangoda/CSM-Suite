"use client"

import type React from "react"
import { useState } from "react"
import type { Workflow, FieldValidation } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FieldValidationFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const FieldValidationForm: React.FC<FieldValidationFormProps> = ({ workflow, setWorkflow }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [selectedField, setSelectedField] = useState<string>("")
  const [isRequired, setIsRequired] = useState<boolean>(false)
  const [validationMessage, setValidationMessage] = useState<string>("")
  const [validationRegex, setValidationRegex] = useState<string>("")
  const [minFileCount, setMinFileCount] = useState<number>(0)

  const addFieldValidation = () => {
    if (!selectedStatus || !selectedField) {
      alert("Please select both status and field!")
      return
    }

    const validation: FieldValidation = {
      fieldID: selectedField,
      required: isRequired,
    }

    if (validationMessage) {
      validation.message = validationMessage
    }

    if (validationRegex) {
      validation.validationRegex = validationRegex
    }

    // Only add minFileCount if the field type is file
    if (workflow.customFields[selectedField]?.type === "file" && minFileCount > 0) {
      validation.minFileCount = minFileCount
    }

    setWorkflow((prev) => {
      const updatedStatuses = prev.statusFlow.statuses.map((status) => {
        if (status.id === selectedStatus) {
          return {
            ...status,
            fieldsValidation: [...(status.fieldsValidation || []), validation],
          }
        }
        return status
      })

      return {
        ...prev,
        statusFlow: {
          ...prev.statusFlow,
          statuses: updatedStatuses,
        },
      }
    })

    // Reset form
    setIsRequired(false)
    setValidationMessage("")
    setValidationRegex("")
    setMinFileCount(0)
  }

  const removeFieldValidation = (statusId: string, index: number) => {
    setWorkflow((prev) => {
      const updatedStatuses = prev.statusFlow.statuses.map((status) => {
        if (status.id === statusId && status.fieldsValidation) {
          return {
            ...status,
            fieldsValidation: status.fieldsValidation.filter((_, i) => i !== index),
          }
        }
        return status
      })

      return {
        ...prev,
        statusFlow: {
          ...prev.statusFlow,
          statuses: updatedStatuses,
        },
      }
    })
  }

  // Check if the selected field is a file type
  const isFileType = selectedField && workflow.customFields[selectedField]?.type === "file"

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Field Validation Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="statusSelect">Status</Label>
                <TooltipHelper content="The status for which this validation rule applies." />
              </div>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="statusSelect">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {workflow.statusFlow.statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="fieldSelect">Field</Label>
                <TooltipHelper content="The field to validate." />
              </div>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger id="fieldSelect">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(workflow.customFields).map(([fieldId, field]) => (
                    <SelectItem key={fieldId} value={fieldId}>
                      {field.name} ({field.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isRequired" checked={isRequired} onCheckedChange={(checked) => setIsRequired(!!checked)} />
            <Label htmlFor="isRequired">Required Field</Label>
            <TooltipHelper content="If checked, this field will be required when the status is set." />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="validationMessage">Validation Message</Label>
              <TooltipHelper content="The message to display when validation fails." />
            </div>
            <Input
              id="validationMessage"
              value={validationMessage}
              onChange={(e) => setValidationMessage(e.target.value)}
              placeholder="Please enter a valid value"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="validationRegex">Validation Regex (optional)</Label>
              <TooltipHelper content="Regular expression pattern for validation." />
            </div>
            <Input
              id="validationRegex"
              value={validationRegex}
              onChange={(e) => setValidationRegex(e.target.value)}
              placeholder="^[a-zA-Z0-9]+$"
            />
          </div>

          {/* Only show minFileCount for file type fields */}
          {isFileType && (
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="minFileCount">Minimum File Count</Label>
                <TooltipHelper content="Minimum number of files required for file upload fields." />
              </div>
              <Input
                id="minFileCount"
                type="number"
                min="0"
                value={minFileCount}
                onChange={(e) => setMinFileCount(Number.parseInt(e.target.value) || 0)}
              />
            </div>
          )}

          <Button onClick={addFieldValidation} className="w-full">
            Add Validation
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Validations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Validation Message</TableHead>
                <TableHead>Validation Regex</TableHead>
                {/* Only show minFileCount column if there are file validations */}
                {workflow.statusFlow.statuses.some(
                  (status) =>
                    status.fieldsValidation &&
                    status.fieldsValidation.some(
                      (validation) =>
                        validation.minFileCount !== undefined &&
                        workflow.customFields[validation.fieldID]?.type === "file",
                    ),
                ) && <TableHead>Min File Count</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflow.statusFlow.statuses.map((status) =>
                status.fieldsValidation && status.fieldsValidation.length > 0
                  ? status.fieldsValidation.map((validation, index) => (
                      <TableRow key={`${status.id}-${index}`}>
                        <TableCell>{status.name}</TableCell>
                        <TableCell>{workflow.customFields[validation.fieldID]?.name}</TableCell>
                        <TableCell>{validation.required ? "Yes" : "No"}</TableCell>
                        <TableCell>{validation.message || "-"}</TableCell>
                        <TableCell>{validation.validationRegex || "-"}</TableCell>
                        {/* Only show minFileCount if there are file validations */}
                        {workflow.statusFlow.statuses.some(
                          (status) =>
                            status.fieldsValidation &&
                            status.fieldsValidation.some(
                              (validation) =>
                                validation.minFileCount !== undefined &&
                                workflow.customFields[validation.fieldID]?.type === "file",
                            ),
                        ) && (
                          <TableCell>
                            {workflow.customFields[validation.fieldID]?.type === "file" &&
                            validation.minFileCount !== undefined
                              ? validation.minFileCount
                              : "-"}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => removeFieldValidation(status.id, index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  : null,
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default FieldValidationForm
