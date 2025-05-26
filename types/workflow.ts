export type JsonValue = string | number | boolean | null | JsonObject | JsonArray
export interface JsonObject {
  [key: string]: JsonValue
}
export type JsonArray = JsonValue[]

export interface EnumValue {
  id: string
  name: string
  backgroundColor?: string
  textColor?: string
  statusTextColor?: string
  statusBackgroundColor?: string
  triggers?: Trigger[]
  highPriorityFields?: string[]
  editableFields?: string[]
  fieldsValidation?: FieldValidation[]
  finalState?: boolean
}

export interface FieldValidation {
  fieldID: string
  value?: string
  required?: boolean
  message?: string
  validationRegex?: string
  minFileCount?: number
}

export interface Transition {
  sourceState: string
  targetStates: string[]
}

export interface ConditionalTransition {
  condition: JsonObject
  transitions: Transition[]
}

export interface Trigger {
  channel:
    | "email"
    | "sms"
    | "fieldChange"
    | "fieldChangeRevert"
    | "loyaltyFieldSync"
    | "automaticEscalationReset"
    | "fieldCalculator"
    | "pdfCreation"
  template?: string
  target?: "admin" | "customer" | "employee"
  contacts?: string[]
  contactFilters?: string[]
  adminUserQuery?: JsonObject
  customFields?: string[]
  appendEditUrl?: boolean
  condition?: JsonObject
  changingFields?: { id: string; value: string }[]
  syncFields?: { caseField: string; loyaltyField: string }[]
  evaluationFields?: JsonValue[]
  changingField?: { id: string }
  evaluationExpression?: JsonObject
}

export interface UserRestriction {
  restrictionType?: "userBased"
  owner?: {
    allowStatus: string[]
  }
  reporter?: {
    allowStatus: string[]
  }
  admin?: {
    emails: string[]
    allowStatus: string[]
  }
  userList?: string[]
  allowStatus?: string[]
  editableFields?: {
    type: string
    values: {
      statusID: string
      fields: string[]
    }[]
  }
  highPriorityFields?: {
    statusID: string
    fields: string[]
  }[]
}

export interface EnumField {
  name: string
  type: "enum"
  readOnly?: boolean
  values: EnumValue[]
  transitions?: Transition[]
  conditionalTransitions?: ConditionalTransition[]
  userRestriction?: UserRestriction[]
}

export interface CustomField {
  name: string
  type: string
  readOnly?: boolean
  hidden?: boolean
  required?: boolean
  values?: EnumValue[]
  wfd_boundComment?: {
    page: { pageID: string; pageName: string }
    comment: { commentID: string; commentName: string }
  }
}

export interface AdminHierarchy {
  list: string
  customFieldsEditEnabled?: boolean
  userEmoSignatureFiltering?: boolean
  userBaseRestrictions?: {
    emails: string[]
    restrictedColumns: string[]
    allowedColumns3?: string[]
  }[]
  headers: {
    id: string
    name: string
    type: "customField" | "contact"
  }[]
  id?: string
  lastGroupId?: number
}

export interface Assignment {
  triggers?: Trigger[]
  automaticAssignment?: {
    isEnabled: boolean
    email: string
    filteringQuery?: JsonObject
    triggerFlows: {
      condition?: JsonObject
      skipAssignment?: boolean
      levels: {
        nextLevelTime: number
        assignee?: string
        fieldsChange?: { id: string; value: string }[]
      }[]
    }[]
  }
}

export interface WorkflowCreation {
  email: string
  triggers?: Trigger[]
}

export interface Workflow {
  reportNamePrefix: string
  reporterNamePrefix: string
  descriptionFormat: string
  name: string
  nameTemplate: string
  descriptionTemplate: string
  type: EnumField
  status: EnumField
  priority: EnumField
  timeSpent: {
    name: string
    type: string
    hidden?: boolean
  }
  customFields: Record<string, CustomField>
  adminHierarchy?: AdminHierarchy
  assignment?: Assignment
  workflowCreation?: WorkflowCreation
  workflowGlobalConfig?: {
    reminders?: {
      isEnabled: boolean
      timeZone?: string
      filteringQuery?: JsonObject
      triggerFlows: {
        condition?: JsonObject
        repeat: "daily" | "hourly" | "weekly"
        repeatInterval?: number
        time?: string
        dayOfTheWeek?: string
        triggers: Trigger[]
      }[]
    }
    hideHighPriorityFieldCollapse?: boolean
    highPriorityFieldsFilterMethod?: "intersection" | "union"
  }
  conditionalFieldChange?: {
    hideCollapse?: boolean
    defaultFieldChange?: {
      highPriorityFields: string[]
    }
    baseConditions: {
      condition: JsonObject
      highPriorityFields: string[]
      editableFields: string[]
    }[]
  }
  subTask?: {
    isEnabled: boolean
    titles?: {
      name: string
      createButtonTitle: string
      currentSubtaskListButtonTitle: string
    }
    workflowId: string
    sort?: {
      fieldId: string
      name: string
      order?: "asc" | "desc"
    }[]
    conditionalStyleChange?: {
      condition: JsonObject
      style: {
        border: string
      }
    }[]
    visibleFields?: string[]
    mapping?: {
      field: string
      targetField: string
      fieldPrefix?: string
    }[]
    defaultValues?: {
      field: string
      value: string
    }[]
    placeholderValues?: {
      field: string
      value: string
    }[]
    hiddenFields?: string[]
    titleField?: string
  }
  export?: {
    unwind: boolean
    unwindValue: string
    excludeFields: string[]
    renameFields: {
      id: string
      name: string
    }[]
  }
  reportSensor?: string
  tableEdit?: string
  filePreview?: string
  initialAssignee?: string
}
