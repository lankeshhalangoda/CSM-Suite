"use client"

import type React from "react"
import { useState } from "react"
import type { Workflow } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TooltipHelper from "../ui/tooltip-helper"

interface BasicInfoFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({ workflow, setWorkflow }) => {
  const [workflowName, setWorkflowName] = useState<string>(workflow.workflowName || "")
  const [workflowType, setWorkflowType] = useState<string>(workflow.workflowType || "ccm")
  const [reportNamePrefix, setReportNamePrefix] = useState<string>(workflow.reportNamePrefix || "")
  const [reporterNamePrefix, setReporterNamePrefix] = useState<string>(workflow.reporterNamePrefix || "")
  const [nameTemplate, setNameTemplate] = useState<string>(workflow.nameTemplate || "")
  const [descriptionTemplate, setDescriptionTemplate] = useState<string>(workflow.descriptionTemplate || "")

  const handleWorkflowNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkflowName(e.target.value)
  }

  const handleWorkflowTypeChange = (value: string) => {
    setWorkflowType(value)
  }

  const handleReportNamePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportNamePrefix(e.target.value)
  }

  const handleReporterNamePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReporterNamePrefix(e.target.value)
  }

  const handleNameTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameTemplate(e.target.value)
  }

  const handleDescriptionTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionTemplate(e.target.value)
  }

  const saveBasicInfo = () => {
    setWorkflow((prev) => {
      const updatedWorkflow = {
        ...prev,
        workflowName,
        workflowType,
        reportNamePrefix,
        reporterNamePrefix,
        nameTemplate,
        descriptionTemplate,
        reportSensor: "inci1", // Always set to inci1 as required
      }

      // If workflow type changed, we need to update the parent component
      // This will be handled by the parent's useEffect
      return updatedWorkflow
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="workflowName">Workflow Name</Label>
              <TooltipHelper content="The name of your workflow. This will be displayed in the Emojot platform." />
            </div>
            <Input id="workflowName" value={workflowName} onChange={handleWorkflowNameChange} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="workflowType">Workflow Type</Label>
              <TooltipHelper content="The type of workflow you want to create. CCM for Customer Complaint Management, ORM for Online Reputation Management, or Combined for both." />
            </div>
            <Select value={workflowType} onValueChange={handleWorkflowTypeChange}>
              <SelectTrigger id="workflowType">
                <SelectValue placeholder="Select workflow type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ccm">Customer Complaint Management (CCM)</SelectItem>
                <SelectItem value="orm">Online Reputation Management (ORM)</SelectItem>
                <SelectItem value="combined">Combined (CCM + ORM)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="reportNamePrefix">Report Name Prefix</Label>
              <TooltipHelper content="The prefix that will be added to the report name. For example, 'Customer Complaint' or 'Online Review'." />
            </div>
            <Input id="reportNamePrefix" value={reportNamePrefix} onChange={handleReportNamePrefixChange} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="reporterNamePrefix">Reporter Name Prefix</Label>
              <TooltipHelper content="The prefix that will be added to the reporter name. For example, 'Customer' or 'Reviewer'." />
            </div>
            <Input id="reporterNamePrefix" value={reporterNamePrefix} onChange={handleReporterNamePrefixChange} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="nameTemplate">Name Template</Label>
              <TooltipHelper content="The template for generating report names. You can use placeholders like $type$, $location$, etc." />
            </div>
            <Input id="nameTemplate" value={nameTemplate} onChange={handleNameTemplateChange} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="descriptionTemplate">Description Template</Label>
              <TooltipHelper content="The template for generating report descriptions. You can use placeholders like $type$, $location$, etc." />
            </div>
            <Input id="descriptionTemplate" value={descriptionTemplate} onChange={handleDescriptionTemplateChange} />
          </div>

          <div className="pt-4">
            <Button onClick={saveBasicInfo}>Save Basic Information</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BasicInfoForm
