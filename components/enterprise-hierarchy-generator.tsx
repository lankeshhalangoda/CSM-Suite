"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Download, Upload, X, ArrowLeft, ArrowRight } from "lucide-react"
import * as XLSX from "xlsx"

// Define the structure for our data
interface ColumnDefinition {
  id: string
  name: string
}

interface RowData {
  [key: string]: string
}

export default function EnterpriseHierarchyGenerator() {
  // State for columns (Location is required)
  const [columns, setColumns] = useState<ColumnDefinition[]>([{ id: "col-1", name: "Location" }])

  // State for rows of data
  const [rows, setRows] = useState<RowData[]>([{ "col-1": "" }])

  // State for new column name
  const [newColumnName, setNewColumnName] = useState("")

  // Reference for file input
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Add a new column
  const addColumn = () => {
    if (!newColumnName.trim()) return

    // Check if column already exists
    if (columns.some((col) => col.name === newColumnName)) {
      alert("Column already exists!")
      return
    }

    const newColumnId = `col-${columns.length + 1}`
    setColumns([...columns, { id: newColumnId, name: newColumnName }])

    // Add empty value for this column to all existing rows
    const updatedRows = rows.map((row) => ({
      ...row,
      [newColumnId]: "",
    }))

    setRows(updatedRows)
    setNewColumnName("")
  }

  // Remove a column (prevent removing Location)
  const removeColumn = (columnId: string) => {
    const columnToRemove = columns.find((col) => col.id === columnId)
    if (columnToRemove?.name === "Location") {
      alert("Cannot remove the Location column!")
      return
    }

    const updatedColumns = columns.filter((col) => col.id !== columnId)
    setColumns(updatedColumns)

    // Remove this column from all rows
    const updatedRows = rows.map((row) => {
      const newRow = { ...row }
      delete newRow[columnId]
      return newRow
    })

    setRows(updatedRows)
  }

  // Move column left
  const moveColumnLeft = (index: number) => {
    if (index <= 0) return

    const newColumns = [...columns]
    const temp = newColumns[index]
    newColumns[index] = newColumns[index - 1]
    newColumns[index - 1] = temp
    setColumns(newColumns)
  }

  // Move column right
  const moveColumnRight = (index: number) => {
    if (index >= columns.length - 1) return

    const newColumns = [...columns]
    const temp = newColumns[index]
    newColumns[index] = newColumns[index + 1]
    newColumns[index + 1] = temp
    setColumns(newColumns)
  }

  // Add a new empty row
  const addRow = () => {
    const newRow: RowData = {}
    columns.forEach((col) => {
      newRow[col.id] = ""
    })
    setRows([...rows, newRow])
  }

  // Remove a row
  const removeRow = (index: number) => {
    const updatedRows = [...rows]
    updatedRows.splice(index, 1)
    setRows(updatedRows)
  }

  // Handle cell value change
  const handleCellChange = (rowIndex: number, columnId: string, value: string) => {
    const updatedRows = [...rows]
    updatedRows[rowIndex] = {
      ...updatedRows[rowIndex],
      [columnId]: value,
    }
    setRows(updatedRows)
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: "array" })

        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet)

        if (jsonData.length === 0) {
          alert("No data found in the uploaded file!")
          return
        }

        // Extract column names from the first row
        const uploadedColumns: ColumnDefinition[] = []
        const firstRow = jsonData[0]
        let hasLocationColumn = false

        Object.keys(firstRow).forEach((key, index) => {
          if (key === "Location") hasLocationColumn = true
          uploadedColumns.push({ id: `col-${index + 1}`, name: key })
        })

        // Ensure Location column exists
        if (!hasLocationColumn) {
          alert("Uploaded file must contain a 'Location' column!")
          return
        }

        // Map the data to our format
        const uploadedRows: RowData[] = jsonData.map((row) => {
          const newRow: RowData = {}
          uploadedColumns.forEach((col) => {
            newRow[col.id] = row[col.name] || ""
          })
          return newRow
        })

        setColumns(uploadedColumns)
        setRows(uploadedRows)
      } catch (error) {
        console.error("Error parsing Excel file:", error)
        alert("Failed to parse the Excel file. Please ensure it's a valid Excel file.")
      }
    }

    reader.readAsArrayBuffer(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Generate and download Excel file
  const downloadExcel = () => {
    try {
      // Check if we have data
      if (rows.length === 0 || rows.every((row) => !row["col-1"])) {
        alert("Please add some data before downloading!")
        return
      }

      // Convert our data format to what XLSX expects
      const excelData = rows.map((row) => {
        const excelRow: Record<string, string> = {}
        columns.forEach((col) => {
          excelRow[col.name] = row[col.id] || ""
        })
        return excelRow
      })

      // Create a new workbook
      const workbook = XLSX.utils.book_new()
      const worksheet = XLSX.utils.json_to_sheet(excelData)

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, "Enterprise Hierarchy")

      // Write to a binary string
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })

      // Create a Blob from the buffer
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })

      // Create a download link and trigger the download
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "enterprise_hierarchy.xlsx"
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error generating Excel file:", error)
      alert("Failed to generate Excel file. Please check the console for details.")
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Enterprise Hierarchy Generator</CardTitle>
        <CardDescription>Create or upload an enterprise hierarchy file with customizable columns</CardDescription>
      </CardHeader>

      <CardContent>
        {/* Column Management */}
        <div className="mb-6 space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Label htmlFor="new-column">Add New Column</Label>
              <Input
                id="new-column"
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                placeholder="Enter column name"
              />
            </div>
            <Button onClick={addColumn} className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Column
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Existing File
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".xlsx,.xls" className="hidden" />

            <Button onClick={downloadExcel} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Download Excel
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <div className="border rounded-md overflow-auto max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={column.id} className="min-w-[150px]">
                    <div className="flex items-center justify-between">
                      <span>{column.name}</span>
                      <div className="flex items-center">
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveColumnLeft(index)}
                            className="h-6 w-6"
                            title="Move column left"
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        )}
                        {index < columns.length - 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => moveColumnRight(index)}
                            className="h-6 w-6"
                            title="Move column right"
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {column.name !== "Location" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeColumn(column.id)}
                            className="h-6 w-6"
                            title="Remove column"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.id}`}>
                      <Input
                        value={row[column.id] || ""}
                        onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
                        placeholder={`Enter ${column.name}`}
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => removeRow(rowIndex)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Add Row Button */}
        <Button onClick={addRow} className="mt-4 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Row
        </Button>
      </CardContent>
    </Card>
  )
}
