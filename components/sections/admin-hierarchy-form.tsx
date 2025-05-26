"use client"

import type React from "react"
import { useEffect } from "react"
import type { Workflow } from "@/types/workflow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AdminHierarchyFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const AdminHierarchyForm: React.FC<AdminHierarchyFormProps> = ({ workflow, setWorkflow }) => {
  // Initialize default admin hierarchy headers if they don't exist
  useEffect(() => {
    if (!workflow.adminHierarchy || !workflow.adminHierarchy.headers || workflow.adminHierarchy.headers.length === 0) {
      const timestamp = Date.now()
      const randomNumber = Math.floor(Math.random() * 1000000000)

      setWorkflow((prev) => ({
        ...prev,
        adminHierarchy: {
          list: "admin",
          headers: [
            {
              id: "location",
              name: "Location",
              type: "customField",
            },
            {
              id: "ticketAssignee",
              name: "Ticket Assignee",
              type: "contact",
            },
            {
              id: "ticketCreationAlert",
              name: "Ticket Creation Alert",
              type: "contact",
            },
            {
              id: "ticketResolutionAlert",
              name: "Ticket Resolution Alert",
              type: "contact",
            },
          ],
          id: `AHI_${timestamp}_${randomNumber}`,
        },
      }))
    } else if (workflow.adminHierarchy && workflow.adminHierarchy.list !== "admin") {
      setWorkflow((prev) => ({
        ...prev,
        adminHierarchy: {
          ...prev.adminHierarchy,
          list: "admin",
        },
      }))
    }
  }, [workflow, setWorkflow])

  const addHeader = (type: "customField" | "contact", id: string, name: string) => {
    // Check if header already exists
    if (workflow.adminHierarchy.headers.some((h) => h.id === id && h.type === type)) {
      alert("This header already exists in the admin hierarchy!")
      return
    }

    setWorkflow((prev) => ({
      ...prev,
      adminHierarchy: {
        ...prev.adminHierarchy,
        headers: [...prev.adminHierarchy.headers, { id, name, type }],
      },
    }))
  }

  const removeHeader = (index: number) => {
    setWorkflow((prev) => ({
      ...prev,
      adminHierarchy: {
        ...prev.adminHierarchy,
        headers: prev.adminHierarchy.headers.filter((_, i) => i !== index),
      },
    }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Hierarchy Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="adminList">Admin List Name</Label>
              <TooltipHelper content="The name of the admin list used for hierarchy management." />
            </div>
            <Input
              id="adminList"
              value={workflow.adminHierarchy?.list || "admin"}
              onChange={(e) =>
                setWorkflow((prev) => ({
                  ...prev,
                  adminHierarchy: {
                    ...prev.adminHierarchy,
                    list: e.target.value,
                  },
                }))
              }
              placeholder="admin"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Admin Hierarchy Headers</Label>
              <TooltipHelper content="Headers define the columns in the admin hierarchy table." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Add Custom Field Header</Label>
                <Select
                  onValueChange={(value) => {
                    const field = workflow.customFields[value]
                    if (field) {
                      addHeader("customField", value, field.name)
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select custom field" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(workflow.customFields).map(([id, field]) => (
                      <SelectItem key={id} value={id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Add Contact Filter Header</Label>
                <div className="flex space-x-2">
                  <Input id="contactFilterName" placeholder="Contact filter name" />
                  <Button
                    onClick={() => {
                      const input = document.getElementById("contactFilterName") as HTMLInputElement
                      if (input.value) {
                        addHeader("contact", input.value, input.value)
                        input.value = ""
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflow.adminHierarchy?.headers?.map((header, index) => (
                  <TableRow key={`${header.type}-${header.id}`}>
                    <TableCell>{header.name}</TableCell>
                    <TableCell>{header.type === "customField" ? "Custom Field" : "Contact Filter"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeHeader(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminHierarchyForm
