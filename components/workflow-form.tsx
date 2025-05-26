import type React from "react"
import type { Workflow } from "@/types/workflow"
import BasicInfoForm from "@/components/sections/basic-info-form"
import TypeConfigForm from "@/components/sections/type-config-form"
import StatusConfigForm from "@/components/sections/status-config-form"
import PriorityConfigForm from "@/components/sections/priority-config-form"
import CustomFieldsForm from "@/components/sections/custom-fields-form"
import AdminHierarchyForm from "@/components/sections/admin-hierarchy-form"
import TriggersForm from "@/components/sections/triggers-form"
import TransitionsForm from "@/components/sections/transitions-form"
import AssignmentForm from "@/components/sections/assignment-form"
import NotificationsForm from "@/components/sections/notifications-form"
import FieldValidationForm from "@/components/sections/field-validation-form"
import RemindersForm from "@/components/sections/reminders-form"
import SubTasksForm from "@/components/sections/subtasks-form"
import AdvancedConfigForm from "@/components/sections/advanced-config-form"
import CodePreviewForm from "@/components/sections/code-preview-form"

interface WorkflowFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
  currentSection: string
  onWorkflowTypeChange?: (type: string) => void
}

const WorkflowForm: React.FC<WorkflowFormProps> = ({ workflow, setWorkflow, currentSection, onWorkflowTypeChange }) => {
  // Generate the final workflow JSON for code preview
  const generateWorkflowJson = () => {
    // Transform the workflow data into the expected JSON format
    const workflowJson: any = {
      reportNamePrefix: workflow.reportNamePrefix || `${workflow.workflowName} Ticket`,
      reporterNamePrefix: workflow.reporterNamePrefix || "Customer",
      descriptionFormat: "text", // Always text as per requirements
      name: workflow.workflowName,
      nameTemplate: workflow.nameTemplate || `${workflow.workflowName} Complaint: $type$`,
      descriptionTemplate: workflow.descriptionTemplate || "Customer Complaint from $type$",
      type: workflow.type,
      status: {
        name: "Status",
        type: "enum",
        values: workflow.statusFlow.statuses.map((status) => {
          const statusObj: any = {
            id: status.id,
            name: status.name,
          }

          if (status.backgroundColor) {
            statusObj.backgroundColor = status.backgroundColor
          }

          if (status.textColor) {
            statusObj.textColor = status.textColor
          }

          if (status.statusTextColor) {
            statusObj.statusTextColor = status.statusTextColor
          }

          if (status.statusBackgroundColor) {
            statusObj.statusBackgroundColor = status.statusBackgroundColor
          }

          if (status.triggers && status.triggers.length > 0) {
            statusObj.triggers = status.triggers
          }

          if (status.fieldsValidation && status.fieldsValidation.length > 0) {
            statusObj.fieldsValidation = status.fieldsValidation
          }

          if (status.highPriorityFields && status.highPriorityFields.length > 0) {
            statusObj.highPriorityFields = status.highPriorityFields
          }

          if (status.editableFields && status.editableFields.length > 0) {
            statusObj.editableFields = status.editableFields
          }

          return statusObj
        }),
      },
      priority: workflow.priority,
      customFields: {},
      timeZone: -330, // Always -330 as per requirements
    }

    // Add transitions if they exist
    if (workflow.statusFlow.transitions && workflow.statusFlow.transitions.length > 0) {
      workflowJson.status.transitions = workflow.statusFlow.transitions
    }

    // Add conditional transitions if they exist
    if (workflow.statusFlow.conditionalTransitions && workflow.statusFlow.conditionalTransitions.length > 0) {
      workflowJson.status.conditionalTransitions = workflow.statusFlow.conditionalTransitions
    }

    // Add reportSensor if provided
    if (workflow.reportSensor) {
      workflowJson.reportSensor = workflow.reportSensor
    }

    // Add adminListName if provided
    if (workflow.adminListName) {
      workflowJson.adminListName = workflow.adminListName
    }

    // Transform custom fields
    Object.entries(workflow.customFields).forEach(([fieldId, field]) => {
      workflowJson.customFields[fieldId] = {
        name: field.name,
        type: field.type,
        required: field.required,
        readOnly: field.readOnly,
        editable: field.editable,
      }

      if (field.hidden) {
        workflowJson.customFields[fieldId].hidden = field.hidden
      }

      if ((field.type === "enum" || field.type === "multiselect") && field.values && field.values.length > 0) {
        workflowJson.customFields[fieldId].values = field.values
      }

      // Include wfd_boundComment if it exists (for ER mapping)
      if (field.wfd_boundComment) {
        workflowJson.customFields[fieldId].wfd_boundComment = field.wfd_boundComment
      }
    })

    // Add admin hierarchy
    if (workflow.adminHierarchy) {
      workflowJson.adminHierarchy = {
        list: workflow.adminHierarchy.list,
        headers: workflow.adminHierarchy.headers,
      }

      if (workflow.adminHierarchy.id) {
        workflowJson.adminHierarchy.id = workflow.adminHierarchy.id
      }

      if (workflow.adminHierarchy.customFieldsEditEnabled) {
        workflowJson.adminHierarchy.customFieldsEditEnabled = workflow.adminHierarchy.customFieldsEditEnabled
      }
    }

    // Add workflow creation triggers if they exist
    if (workflow.workflowCreation) {
      workflowJson.workflowCreation = workflow.workflowCreation
    }

    // Add assignment triggers
    if (workflow.assignment) {
      workflowJson.assignment = workflow.assignment
    }

    // Add time spent
    if (workflow.timeSpent) {
      workflowJson.timeSpent = workflow.timeSpent
    }

    // Add workflow global config
    if (workflow.workflowGlobalConfig) {
      workflowJson.workflowGlobalConfig = workflow.workflowGlobalConfig
    }

    // Add conditional field change
    if (workflow.conditionalFieldChange) {
      workflowJson.conditionalFieldChange = workflow.conditionalFieldChange
    }

    // Add subtask config
    if (workflow.subTask) {
      workflowJson.subTask = workflow.subTask
    }

    // Add export config
    if (workflow.export) {
      workflowJson.export = workflow.export
    }

    return workflowJson
  }

  const renderSection = () => {
    switch (currentSection) {
      case "basicInfo":
        return (
          <BasicInfoForm workflow={workflow} setWorkflow={setWorkflow} onWorkflowTypeChange={onWorkflowTypeChange} />
        )
      case "typeConfig":
        return <TypeConfigForm workflow={workflow} setWorkflow={setWorkflow} />
      case "statusConfig":
        return <StatusConfigForm workflow={workflow} setWorkflow={setWorkflow} />
      case "priorityConfig":
        return <PriorityConfigForm workflow={workflow} setWorkflow={setWorkflow} />
      case "adminHierarchy":
        return <AdminHierarchyForm workflow={workflow} setWorkflow={setWorkflow} />
      case "customFields":
        return <CustomFieldsForm workflow={workflow} setWorkflow={setWorkflow} />
      case "triggers":
        return <TriggersForm workflow={workflow} setWorkflow={setWorkflow} />
      case "transitions":
        return <TransitionsForm workflow={workflow} setWorkflow={setWorkflow} />
      case "assignment":
        return <AssignmentForm workflow={workflow} setWorkflow={setWorkflow} />
      case "notifications":
        return <NotificationsForm workflow={workflow} setWorkflow={setWorkflow} />
      case "fieldValidation":
        return <FieldValidationForm workflow={workflow} setWorkflow={setWorkflow} />
      case "reminders":
        return <RemindersForm workflow={workflow} setWorkflow={setWorkflow} />
      case "subTasks":
        return <SubTasksForm workflow={workflow} setWorkflow={setWorkflow} />
      case "advancedConfig":
        return <AdvancedConfigForm workflow={workflow} setWorkflow={setWorkflow} />
      case "exportOptions":
        return <CodePreviewForm workflow={generateWorkflowJson()} />
      default:
        return <BasicInfoForm workflow={workflow} setWorkflow={setWorkflow} />
    }
  }

  return <div className="space-y-6">{renderSection()}</div>
}

export default WorkflowForm
