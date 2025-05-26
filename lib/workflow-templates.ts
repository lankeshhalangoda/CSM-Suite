import { Coffee, Hotel, Package, Code, Sparkles } from "lucide-react"

// Sample workflow templates for the Workflow Generator
export const jsonTemplates: Record<string, any> = {
  Barista: {
    reportNamePrefix: "Case",
    reporterNamePrefix: "Customer",
    descriptionFormat: "text",
    name: "Barista Workflow",
    nameTemplate: "Barista Case: $type$",
    descriptionTemplate: "Barista Case from $type$",
    type: {
      name: "Type",
      type: "enum",
      values: [
        {
          id: "type1",
          name: "Customer Complaint",
        },
        {
          id: "type2",
          name: "Staff Feedback",
        },
        {
          id: "type3",
          name: "Product Issue",
        },
      ],
    },
    status: {
      name: "Status",
      type: "enum",
      values: [
        {
          id: "open",
          name: "Open",
          backgroundColor: "#f4b000",
          textColor: "#ffffff",
        },
        {
          id: "in_progress",
          name: "In Progress",
          backgroundColor: "#0088cc",
          textColor: "#ffffff",
        },
        {
          id: "resolved",
          name: "Resolved",
          backgroundColor: "#00aa55",
          textColor: "#ffffff",
        },
      ],
      transitions: [
        {
          sourceState: "open",
          targetStates: ["in_progress"],
        },
        {
          sourceState: "in_progress",
          targetStates: ["resolved"],
        },
      ],
    },
    priority: {
      name: "Priority",
      type: "enum",
      values: [
        {
          id: "low",
          name: "Low",
        },
        {
          id: "medium",
          name: "Medium",
        },
        {
          id: "high",
          name: "High",
        },
      ],
    },
    customFields: {
      location: {
        name: "Location",
        type: "enum",
        required: true,
        readOnly: false,
        editable: true,
        values: [
          {
            id: "location1",
            name: "Main Street",
          },
          {
            id: "location2",
            name: "Downtown",
          },
          {
            id: "location3",
            name: "Uptown",
          },
        ],
      },
      rating: {
        name: "Rating",
        type: "string",
        required: true,
        readOnly: true,
        editable: false,
      },
      comment: {
        name: "Comment",
        type: "textArea",
        required: false,
        readOnly: true,
        editable: false,
      },
    },
  },
  "Grand Hotel": {
    reportNamePrefix: "Ticket",
    reporterNamePrefix: "Guest",
    descriptionFormat: "text",
    name: "Grand Hotel Workflow",
    nameTemplate: "Hotel Ticket: $type$",
    descriptionTemplate: "Hotel Ticket from $type$",
    type: {
      name: "Type",
      type: "enum",
      values: [
        {
          id: "type1",
          name: "Guest Complaint",
        },
        {
          id: "type2",
          name: "Maintenance Request",
        },
        {
          id: "type3",
          name: "Room Service",
        },
      ],
    },
    status: {
      name: "Status",
      type: "enum",
      values: [
        {
          id: "new",
          name: "New",
          backgroundColor: "#f4b000",
          textColor: "#ffffff",
        },
        {
          id: "assigned",
          name: "Assigned",
          backgroundColor: "#0088cc",
          textColor: "#ffffff",
        },
        {
          id: "in_progress",
          name: "In Progress",
          backgroundColor: "#8855dd",
          textColor: "#ffffff",
        },
        {
          id: "completed",
          name: "Completed",
          backgroundColor: "#00aa55",
          textColor: "#ffffff",
        },
      ],
      transitions: [
        {
          sourceState: "new",
          targetStates: ["assigned"],
        },
        {
          sourceState: "assigned",
          targetStates: ["in_progress"],
        },
        {
          sourceState: "in_progress",
          targetStates: ["completed"],
        },
      ],
    },
    priority: {
      name: "Priority",
      type: "enum",
      values: [
        {
          id: "low",
          name: "Low",
        },
        {
          id: "medium",
          name: "Medium",
        },
        {
          id: "high",
          name: "High",
        },
        {
          id: "urgent",
          name: "Urgent",
        },
      ],
    },
    customFields: {
      location: {
        name: "Location",
        type: "enum",
        required: true,
        readOnly: false,
        editable: true,
        values: [
          {
            id: "lobby",
            name: "Lobby",
          },
          {
            id: "restaurant",
            name: "Restaurant",
          },
          {
            id: "room",
            name: "Guest Room",
          },
          {
            id: "pool",
            name: "Pool Area",
          },
        ],
      },
      roomNumber: {
        name: "Room Number",
        type: "string",
        required: false,
        readOnly: false,
        editable: true,
      },
      guestName: {
        name: "Guest Name",
        type: "string",
        required: true,
        readOnly: false,
        editable: true,
      },
      comment: {
        name: "Comment",
        type: "textArea",
        required: false,
        readOnly: false,
        editable: true,
      },
    },
  },
  Selyn: {
    reportNamePrefix: "Issue",
    reporterNamePrefix: "Customer",
    descriptionFormat: "text",
    name: "Selyn Workflow",
    nameTemplate: "Selyn Issue: $type$",
    descriptionTemplate: "Selyn Issue from $type$",
    type: {
      name: "Type",
      type: "enum",
      values: [
        {
          id: "product_issue",
          name: "Product Issue",
        },
        {
          id: "delivery_issue",
          name: "Delivery Issue",
        },
        {
          id: "quality_issue",
          name: "Quality Issue",
        },
      ],
    },
    status: {
      name: "Status",
      type: "enum",
      values: [
        {
          id: "open",
          name: "Open",
          backgroundColor: "#f4b000",
          textColor: "#ffffff",
        },
        {
          id: "investigating",
          name: "Investigating",
          backgroundColor: "#0088cc",
          textColor: "#ffffff",
        },
        {
          id: "pending_customer",
          name: "Pending Customer",
          backgroundColor: "#8855dd",
          textColor: "#ffffff",
        },
        {
          id: "resolved",
          name: "Resolved",
          backgroundColor: "#00aa55",
          textColor: "#ffffff",
        },
      ],
      transitions: [
        {
          sourceState: "open",
          targetStates: ["investigating"],
        },
        {
          sourceState: "investigating",
          targetStates: ["pending_customer", "resolved"],
        },
        {
          sourceState: "pending_customer",
          targetStates: ["investigating", "resolved"],
        },
      ],
    },
    priority: {
      name: "Priority",
      type: "enum",
      values: [
        {
          id: "low",
          name: "Low",
        },
        {
          id: "medium",
          name: "Medium",
        },
        {
          id: "high",
          name: "High",
        },
      ],
    },
    customFields: {
      product: {
        name: "Product",
        type: "enum",
        required: true,
        readOnly: false,
        editable: true,
        values: [
          {
            id: "handloom",
            name: "Handloom",
          },
          {
            id: "toys",
            name: "Toys",
          },
          {
            id: "accessories",
            name: "Accessories",
          },
        ],
      },
      orderNumber: {
        name: "Order Number",
        type: "string",
        required: true,
        readOnly: false,
        editable: true,
      },
      customerName: {
        name: "Customer Name",
        type: "string",
        required: true,
        readOnly: false,
        editable: true,
      },
      description: {
        name: "Description",
        type: "textArea",
        required: true,
        readOnly: false,
        editable: true,
      },
    },
  },
  Dipra: {
    reportNamePrefix: "Ticket",
    reporterNamePrefix: "Customer",
    descriptionFormat: "text",
    name: "Dipra Workflow",
    nameTemplate: "Dipra Ticket: $type$",
    descriptionTemplate: "Dipra Ticket from $type$",
    type: {
      name: "Type",
      type: "enum",
      values: [
        {
          id: "technical_issue",
          name: "Technical Issue",
        },
        {
          id: "billing_inquiry",
          name: "Billing Inquiry",
        },
        {
          id: "feature_request",
          name: "Feature Request",
        },
      ],
    },
    status: {
      name: "Status",
      type: "enum",
      values: [
        {
          id: "new",
          name: "New",
          backgroundColor: "#f4b000",
          textColor: "#ffffff",
        },
        {
          id: "assigned",
          name: "Assigned",
          backgroundColor: "#0088cc",
          textColor: "#ffffff",
        },
        {
          id: "in_progress",
          name: "In Progress",
          backgroundColor: "#8855dd",
          textColor: "#ffffff",
        },
        {
          id: "waiting_for_customer",
          name: "Waiting for Customer",
          backgroundColor: "#ff9900",
          textColor: "#ffffff",
        },
        {
          id: "resolved",
          name: "Resolved",
          backgroundColor: "#00aa55",
          textColor: "#ffffff",
        },
      ],
      transitions: [
        {
          sourceState: "new",
          targetStates: ["assigned"],
        },
        {
          sourceState: "assigned",
          targetStates: ["in_progress"],
        },
        {
          sourceState: "in_progress",
          targetStates: ["waiting_for_customer", "resolved"],
        },
        {
          sourceState: "waiting_for_customer",
          targetStates: ["in_progress", "resolved"],
        },
      ],
    },
    priority: {
      name: "Priority",
      type: "enum",
      values: [
        {
          id: "low",
          name: "Low",
        },
        {
          id: "medium",
          name: "Medium",
        },
        {
          id: "high",
          name: "High",
        },
        {
          id: "critical",
          name: "Critical",
        },
      ],
    },
    customFields: {
      product: {
        name: "Product",
        type: "enum",
        required: true,
        readOnly: false,
        editable: true,
        values: [
          {
            id: "web_app",
            name: "Web Application",
          },
          {
            id: "mobile_app",
            name: "Mobile Application",
          },
          {
            id: "api",
            name: "API",
          },
        ],
      },
      version: {
        name: "Version",
        type: "string",
        required: true,
        readOnly: false,
        editable: true,
      },
      accountId: {
        name: "Account ID",
        type: "string",
        required: true,
        readOnly: false,
        editable: true,
      },
      description: {
        name: "Description",
        type: "textArea",
        required: true,
        readOnly: false,
        editable: true,
      },
      steps_to_reproduce: {
        name: "Steps to Reproduce",
        type: "textArea",
        required: false,
        readOnly: false,
        editable: true,
      },
    },
  },
  Midnightdivas: {
    reportNamePrefix: "Request",
    reporterNamePrefix: "Client",
    descriptionFormat: "text",
    name: "Midnightdivas Workflow",
    nameTemplate: "Beauty Request: $type$",
    descriptionTemplate: "Beauty Request from $type$",
    type: {
      name: "Type",
      type: "enum",
      values: [
        {
          id: "appointment",
          name: "Appointment Request",
        },
        {
          id: "product_inquiry",
          name: "Product Inquiry",
        },
        {
          id: "service_feedback",
          name: "Service Feedback",
        },
      ],
    },
    status: {
      name: "Status",
      type: "enum",
      values: [
        {
          id: "new",
          name: "New",
          backgroundColor: "#f4b000",
          textColor: "#ffffff",
        },
        {
          id: "scheduled",
          name: "Scheduled",
          backgroundColor: "#0088cc",
          textColor: "#ffffff",
        },
        {
          id: "completed",
          name: "Completed",
          backgroundColor: "#00aa55",
          textColor: "#ffffff",
        },
        {
          id: "cancelled",
          name: "Cancelled",
          backgroundColor: "#ff5555",
          textColor: "#ffffff",
        },
      ],
      transitions: [
        {
          sourceState: "new",
          targetStates: ["scheduled", "cancelled"],
        },
        {
          sourceState: "scheduled",
          targetStates: ["completed", "cancelled"],
        },
      ],
    },
    priority: {
      name: "Priority",
      type: "enum",
      values: [
        {
          id: "standard",
          name: "Standard",
        },
        {
          id: "premium",
          name: "Premium",
        },
        {
          id: "vip",
          name: "VIP",
        },
      ],
    },
    customFields: {
      service: {
        name: "Service",
        type: "enum",
        required: true,
        readOnly: false,
        editable: true,
        values: [
          {
            id: "haircut",
            name: "Haircut",
          },
          {
            id: "coloring",
            name: "Hair Coloring",
          },
          {
            id: "makeup",
            name: "Makeup",
          },
          {
            id: "nails",
            name: "Nail Service",
          },
        ],
      },
      stylist: {
        name: "Stylist",
        type: "enum",
        required: false,
        readOnly: false,
        editable: true,
        values: [
          {
            id: "stylist1",
            name: "Sarah",
          },
          {
            id: "stylist2",
            name: "Michael",
          },
          {
            id: "stylist3",
            name: "Jennifer",
          },
        ],
      },
      clientName: {
        name: "Client Name",
        type: "string",
        required: true,
        readOnly: false,
        editable: true,
      },
      phoneNumber: {
        name: "Phone Number",
        type: "string",
        required: true,
        readOnly: false,
        editable: true,
      },
      preferredDate: {
        name: "Preferred Date",
        type: "date",
        required: false,
        readOnly: false,
        editable: true,
      },
      notes: {
        name: "Notes",
        type: "textArea",
        required: false,
        readOnly: false,
        editable: true,
      },
    },
  },
}

// Convert jsonTemplates to workflowTemplates format expected by the UI
export const workflowTemplates = [
  {
    id: "Barista",
    name: "Barista Workflow",
    description: "Coffee shop customer service workflow",
    icon: Coffee,
    workflow: transformToWorkflowFormat(jsonTemplates.Barista),
  },
  {
    id: "Grand Hotel",
    name: "Grand Hotel",
    description: "Hotel guest service management",
    icon: Hotel,
    workflow: transformToWorkflowFormat(jsonTemplates["Grand Hotel"]),
  },
  {
    id: "Selyn",
    name: "Selyn Workflow",
    description: "Product and delivery issue tracking",
    icon: Package,
    workflow: transformToWorkflowFormat(jsonTemplates.Selyn),
  },
  {
    id: "Dipra",
    name: "Dipra Workflow",
    description: "Technical support and billing",
    icon: Code,
    workflow: transformToWorkflowFormat(jsonTemplates.Dipra),
  },
  {
    id: "Midnightdivas",
    name: "Midnightdivas",
    description: "Beauty salon appointment management",
    icon: Sparkles,
    workflow: transformToWorkflowFormat(jsonTemplates.Midnightdivas),
  },
]

// Helper function to transform jsonTemplate format to workflow format
function transformToWorkflowFormat(template: any) {
  return {
    workflowName: template.name || "",
    workflowType: "ccm",
    reportNamePrefix: template.reportNamePrefix || "Case",
    reporterNamePrefix: template.reporterNamePrefix || "Customer",
    nameTemplate: template.nameTemplate || "",
    descriptionTemplate: template.descriptionTemplate || "",
    type: template.type || {
      name: "Type",
      type: "enum",
      readOnly: true,
      values: [],
    },
    statusFlow: {
      statuses:
        template.status?.values?.map((status: any) => ({
          id: status.id,
          name: status.name,
          backgroundColor: status.backgroundColor || "#e6e6e6",
          textColor: status.textColor || "#000000",
          statusTextColor: status.statusTextColor || status.backgroundColor || "#e6e6e6",
          statusBackgroundColor: status.statusBackgroundColor || "#f5f5f5",
          isInitial: status.id === template.status.values[0]?.id,
          isFinal: status.id === template.status.values[template.status.values.length - 1]?.id,
        })) || [],
      transitions: template.status?.transitions || [],
    },
    priority: template.priority || {
      name: "Priority",
      type: "enum",
      values: [],
    },
    customFields: template.customFields || {},
    adminHierarchy: {
      list: "admin",
      headers: [],
    },
    workflowCreation: {
      email: "bot@emojot.com",
      triggers: [],
    },
    assignment: {
      triggers: [],
    },
    timeSpent: {
      name: "Time Spent",
      type: "number",
      hidden: true,
    },
  }
}

export const getAvailableTriggers = () => {
  return {
    customer: [
      "customer_account_created",
      "customer_account_updated",
      "customer_account_deleted",
      "customer_password_reset_request",
      "customer_password_reset_success",
    ],
    order: ["order_created", "order_updated", "order_deleted", "order_shipped", "order_delivered"],
    payment: ["payment_success", "payment_failed", "payment_refunded"],
    product: ["product_created", "product_updated", "product_deleted", "product_low_stock"],
    abandoned_cart: ["abandoned_cart_reminder"],
    promotion: ["promotion_created", "promotion_updated", "promotion_deleted"],
    resolution: [
      "complaintResolutionAlert_email",
      "complaintResolutionAlert_sms",
      "complaintResolutionAlert_orm_email",
      "complaintResolutionAlert_orm_sms",
      "complaintResolution_customer_email",
      "complaintResolution_customer_sms",
    ],
  }
}
