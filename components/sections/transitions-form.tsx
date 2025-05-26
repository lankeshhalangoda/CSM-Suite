"use client"

import type React from "react"
import { useState } from "react"
import type { Workflow } from "@/types/workflow"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, ArrowRight } from "lucide-react"
import TooltipHelper from "../ui/tooltip-helper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface TransitionsFormProps {
  workflow: Workflow
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>
}

const TransitionsForm: React.FC<TransitionsFormProps> = ({ workflow, setWorkflow }) => {
  const [sourceState, setSourceState] = useState<string>("")
  const [targetState, setTargetState] = useState<string>("")

  const addTransition = () => {
    if (!sourceState || !targetState) {
      alert("Please select both source and target states!")
      return
    }

    // Check if transition already exists
    const existingTransition = workflow.statusFlow.transitions?.find((t) => t.sourceState === sourceState)

    if (existingTransition) {
      // Check if target state is already in the transition
      if (existingTransition.targetStates.includes(targetState)) {
        alert("This transition already exists!")
        return
      }

      // Add target state to existing transition
      setWorkflow((prev) => ({
        ...prev,
        statusFlow: {
          ...prev.statusFlow,
          transitions: prev.statusFlow.transitions?.map((t) =>
            t.sourceState === sourceState ? { ...t, targetStates: [...t.targetStates, targetState] } : t,
          ),
        },
      }))
    } else {
      // Create new transition
      setWorkflow((prev) => ({
        ...prev,
        statusFlow: {
          ...prev.statusFlow,
          transitions: [...(prev.statusFlow.transitions || []), { sourceState, targetStates: [targetState] }],
        },
      }))
    }

    // Reset form
    setTargetState("")
  }

  const removeTransition = (sourceState: string, targetState: string) => {
    setWorkflow((prev) => {
      const updatedTransitions = prev.statusFlow.transitions
        ?.map((t) => {
          if (t.sourceState === sourceState) {
            return {
              ...t,
              targetStates: t.targetStates.filter((ts) => ts !== targetState),
            }
          }
          return t
        })
        .filter((t) => t.targetStates.length > 0) // Remove transitions with no target states

      return {
        ...prev,
        statusFlow: {
          ...prev.statusFlow,
          transitions: updatedTransitions,
        },
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status Transitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <div className="flex items-center">
                <span>From Status</span>
                <TooltipHelper content="The starting status for this transition." />
              </div>
              <Select value={sourceState} onValueChange={setSourceState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source status" />
                </SelectTrigger>
                <SelectContent>
                  {workflow.statusFlow.statuses.map((status) => (
                    <SelectItem key={`source-${status.id}`} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center items-center">
              <ArrowRight className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <span>To Status</span>
                <TooltipHelper content="The target status for this transition." />
              </div>
              <Select value={targetState} onValueChange={setTargetState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target status" />
                </SelectTrigger>
                <SelectContent>
                  {workflow.statusFlow.statuses
                    .filter((status) => status.id !== sourceState) // Can't transition to the same status
                    .map((status) => (
                      <SelectItem key={`target-${status.id}`} value={status.id}>
                        {status.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={addTransition} className="w-full">
            Add Transition
          </Button>

          <div className="space-y-2">
            <div className="flex items-center">
              <span>Current Transitions</span>
              <TooltipHelper content="The list of all defined status transitions." />
            </div>

            {workflow.statusFlow.transitions && workflow.statusFlow.transitions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From Status</TableHead>
                    <TableHead>To Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflow.statusFlow.transitions.flatMap((transition) =>
                    transition.targetStates.map((targetState) => (
                      <TableRow key={`${transition.sourceState}-${targetState}`}>
                        <TableCell>
                          {workflow.statusFlow.statuses.find((s) => s.id === transition.sourceState)?.name ||
                            transition.sourceState}
                        </TableCell>
                        <TableCell>
                          {workflow.statusFlow.statuses.find((s) => s.id === targetState)?.name || targetState}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTransition(transition.sourceState, targetState)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )),
                  )}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No transitions configured yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TransitionsForm
