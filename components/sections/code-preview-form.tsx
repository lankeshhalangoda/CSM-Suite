"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Copy, Code, Check } from "lucide-react"

interface CodePreviewFormProps {
  workflow: any
}

const CodePreviewForm: React.FC<CodePreviewFormProps> = ({ workflow }) => {
  // Create a clean copy of the workflow for display
  const [displayWorkflow, setDisplayWorkflow] = useState<any>({})
  const [jsonEditorContent, setJsonEditorContent] = useState<string>("")
  const [isJsonValid, setIsJsonValid] = useState<boolean>(true)
  const [jsonErrorMessage, setJsonErrorMessage] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)

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

  // Helper function to check if a trigger is a resolution trigger
  const isResolutionTrigger = (trigger: any) => {
    return (
      trigger.template?.includes("Resolution") ||
      trigger.template?.includes("resolution") ||
      trigger.template === "complaintResolutionAlert" ||
      trigger.template === "complaintResolutionAlert_email" ||
      trigger.template === "complaintResolutionAlert_sms" ||
      trigger.template === "complaintResolutionAlert_orm" ||
      trigger.template === "complaintResolutionAlert_orm_email" ||
      trigger.template === "complaintResolutionAlert_orm_sms" ||
      trigger.template === "complaintResolution_customer" ||
      trigger.template === "complaintResolution_customer_email" ||
      trigger.template === "complaintResolution_customer_sms" ||
      (trigger.condition && trigger.condition["=="] && trigger.condition["=="][1] === "Resolved") ||
      (trigger.condition &&
        trigger.condition.and &&
        trigger.condition.and.some((cond: any) => cond["=="] && cond["=="][1] === "Resolved"))
    )
  }

  // Process the workflow to ensure all status values have all 4 color types
  useEffect(() => {
    if (!workflow) return

    const processedWorkflow = JSON.parse(JSON.stringify(workflow))
    const workflowType = processedWorkflow.workflowType || "ccm"
    const workflowName = processedWorkflow.workflowName || "Customer Satisfaction Survey"
    const camelCaseWorkflowName = convertToCamelCase(workflowName)

    // Set reportSensor to inci1
    processedWorkflow.reportSensor = "inci1"

    // Ensure type field has proper structure with correct values based on workflow type
    if (processedWorkflow.type) {
      // If no values exist or workflow type changed, generate default values
      if (!processedWorkflow.type.values || processedWorkflow.type.values.length === 0) {
        let typeValues = []

        switch (workflowType) {
          case "ccm":
            typeValues = [{ id: camelCaseWorkflowName, name: workflowName }]
            break
          case "orm":
            typeValues = [{ id: "googleMap", name: "Google" }]
            break
          case "combined":
            typeValues = [
              { id: camelCaseWorkflowName, name: workflowName },
              { id: "googleMap", name: "Google" },
            ]
            break
          default:
            typeValues = [{ id: camelCaseWorkflowName, name: workflowName }]
        }

        processedWorkflow.type.values = typeValues
      }

      processedWorkflow.type = {
        name: processedWorkflow.type.name || "Type",
        type: "enum",
        readOnly: true,
        values: processedWorkflow.type.values,
      }
    }

    // Remove adminListName property completely
    delete processedWorkflow.adminListName

    // Set adminHierarchy list to "admin"
    if (processedWorkflow.adminHierarchy) {
      processedWorkflow.adminHierarchy.list = "admin"
    }

    // Get resolution triggers from workflowCreation.triggers
    const resolutionTriggersFromWorkflow = []
    if (processedWorkflow.workflowCreation && processedWorkflow.workflowCreation.triggers) {
      processedWorkflow.workflowCreation.triggers.forEach((trigger: any) => {
        if (isResolutionTrigger(trigger)) {
          // Clean up the trigger for the Resolved status
          const cleanTrigger = { ...trigger }

          // Remove the status condition since it's implied by being in the Resolved status
          if (
            cleanTrigger.condition &&
            cleanTrigger.condition["=="] &&
            cleanTrigger.condition["=="][1] === "Resolved"
          ) {
            delete cleanTrigger.condition
          }

          // Handle complex conditions (for combined workflows)
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

          // Clean up template names - remove _email and _sms suffixes for the final output
          // if (cleanTrigger.template) {
          //   cleanTrigger.template = cleanTrigger.template.replace("_email", "").replace("_sms", "")
          // }

          resolutionTriggersFromWorkflow.push(cleanTrigger)
        }
      })
    }

    // Transform statusFlow to status for export and handle resolution triggers
    if (processedWorkflow.statusFlow) {
      const statusValues = processedWorkflow.statusFlow.statuses.map((status: any) => {
        const statusObj: any = {
          id: status.id,
          name: status.name,
          backgroundColor: status.backgroundColor || "#e6e6e6",
          textColor: status.textColor || (isColorDark(status.backgroundColor || "#e6e6e6") ? "#ffffff" : "#000000"),
          statusTextColor: status.statusTextColor || status.backgroundColor || "#e6e6e6",
          statusBackgroundColor: status.statusBackgroundColor || lightenColor(status.backgroundColor || "#e6e6e6", 0.8),
        }

        // Add resolution triggers to the "Resolved" status ONLY if they exist in the workflow
        if (status.id === "Resolved" && resolutionTriggersFromWorkflow.length > 0) {
          statusObj.triggers = resolutionTriggersFromWorkflow
        }

        return statusObj
      })

      processedWorkflow.status = {
        name: "Status",
        type: "enum",
        values: statusValues,
        transitions: processedWorkflow.statusFlow.transitions || [],
      }
      delete processedWorkflow.statusFlow
    }

    // Remove color properties from priority values
    if (processedWorkflow.priority && processedWorkflow.priority.values) {
      processedWorkflow.priority.values = processedWorkflow.priority.values.map((priority: any) => {
        const { backgroundColor, textColor, statusTextColor, statusBackgroundColor, ...rest } = priority
        return rest
      })
    }

    // Use the assignment triggers directly from the workflow object
    if (processedWorkflow.assignment && processedWorkflow.assignment.triggers) {
      processedWorkflow.assignment = {
        triggers: processedWorkflow.assignment.triggers,
        ...(processedWorkflow.assignment.automaticAssignment && {
          automaticAssignment: processedWorkflow.assignment.automaticAssignment,
        }),
      }
    }

    // Keep only creation triggers in workflowCreation (filter out resolution triggers)
    if (processedWorkflow.workflowCreation && processedWorkflow.workflowCreation.triggers) {
      processedWorkflow.workflowCreation.triggers = processedWorkflow.workflowCreation.triggers.filter(
        (trigger: any) => !isResolutionTrigger(trigger),
      )
    }

    // Remove unnecessary sections
    delete processedWorkflow.workflowGlobalConfig
    delete processedWorkflow.subTask
    delete processedWorkflow.conditionalFieldChange
    delete processedWorkflow.export
    delete processedWorkflow.tableEdit
    delete processedWorkflow.filePreview
    delete processedWorkflow.initialAssignee

    // Remove internal properties
    delete processedWorkflow.workflowType
    delete processedWorkflow.workflowName

    // Set the final name
    processedWorkflow.name = workflowName

    // Custom Fields - ensure enum values have matching id and name
    if (processedWorkflow.customFields) {
      Object.keys(processedWorkflow.customFields).forEach((fieldKey) => {
        const field = processedWorkflow.customFields[fieldKey]
        if (field.type === "enum" && field.values) {
          // Keep the values as they are - they should already have matching id and name
          field.values = field.values.map((value: any) => ({
            ...value,
            // Ensure id and name are the same
            id: value.name || value.id,
            name: value.name || value.id,
          }))
        }
      })
    }

    setDisplayWorkflow(processedWorkflow)
  }, [workflow])

  // Update JSON content when displayWorkflow changes
  useEffect(() => {
    setJsonEditorContent(JSON.stringify(displayWorkflow, null, 2))
  }, [displayWorkflow])

  // Helper function to determine if a color is dark
  const isColorDark = (hex: string): boolean => {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, "")

    // Parse r, g, b values
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    // Calculate luminance (perceived brightness)
    // Formula: 0.299*R + 0.587*G + 0.114*B
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // If luminance is greater than 0.5, color is light; otherwise, it's dark
    return luminance < 0.5
  }

  // Function to lighten a color
  const lightenColor = (hex: string, factor: number): string => {
    // Remove the hash if it exists
    hex = hex.replace(/^#/, "")

    // Parse r, g, b values
    let r = Number.parseInt(hex.substring(0, 2), 16)
    let g = Number.parseInt(hex.substring(2, 4), 16)
    let b = Number.parseInt(hex.substring(4, 6), 16)

    // Lighten the color
    r = Math.min(255, Math.round(r + (255 - r) * factor))
    g = Math.min(255, Math.round(g + (255 - g) * factor))
    b = Math.min(255, Math.round(b + (255 - b) * factor))

    // Convert back to hex
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
  }

  // Handle JSON editor content change
  const handleJsonEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonEditorContent(e.target.value)
    try {
      JSON.parse(e.target.value)
      setIsJsonValid(true)
      setJsonErrorMessage("")
    } catch (error: any) {
      setIsJsonValid(false)
      setJsonErrorMessage(error.message)
    }
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonEditorContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download code
  const downloadCode = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonEditorContent)
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `workflow_${Date.now()}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center justify-between">
          <span>Code Preview</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCode}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          View and edit the generated workflow JSON code for {workflow.workflowType?.toUpperCase() || "CCM"} workflow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="mb-2 text-sm text-muted-foreground">
            Current workflow type: <span className="font-medium">{workflow.workflowType?.toUpperCase() || "CCM"}</span>
          </div>
          <Textarea
            className="w-full h-96 p-4 bg-muted rounded-md font-mono text-sm"
            value={jsonEditorContent}
            onChange={handleJsonEditorChange}
          />
          {!isJsonValid && (
            <Alert variant="destructive">
              <Code className="h-4 w-4" />
              <AlertTitle>Invalid JSON</AlertTitle>
              <AlertDescription>{jsonErrorMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CodePreviewForm
