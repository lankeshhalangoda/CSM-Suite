"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import TooltipHelper from "@/components/ui/tooltip-helper"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AdvancedConfigFormProps {
  workflow: any
  setWorkflow: React.Dispatch<React.SetStateAction<any>>
}

const AdvancedConfigForm: React.FC<AdvancedConfigFormProps> = ({ workflow, setWorkflow }) => {
  const [activeTab, setActiveTab] = useState("performance")

  // Initialize workflowGlobalConfig if it doesn't exist
  if (!workflow.workflowGlobalConfig) {
    workflow.workflowGlobalConfig = {
      concurrencyLimit: 10,
      maxRetries: 3,
      retryDelay: 5000,
      timeoutMs: 30000,
      cacheEnabled: true,
      cacheTTL: 3600000,
      loggingLevel: "info",
      auditEnabled: true,
    }
  }

  // Update a config value
  const updateConfig = (key: string, value: any) => {
    setWorkflow({
      ...workflow,
      workflowGlobalConfig: {
        ...workflow.workflowGlobalConfig,
        [key]: value,
      },
    })
  }

  // Toggle a boolean config value
  const toggleConfig = (key: string) => {
    setWorkflow({
      ...workflow,
      workflowGlobalConfig: {
        ...workflow.workflowGlobalConfig,
        [key]: !workflow.workflowGlobalConfig[key],
      },
    })
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Advanced Configuration</CardTitle>
          <CardDescription>
            Configure advanced settings for workflow performance, security, and behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="performance" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="integration">Integration</TabsTrigger>
              <TabsTrigger value="logging">Logging</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="concurrency-limit">
                      Concurrency Limit
                      <TooltipHelper content="Maximum number of concurrent operations" />
                    </Label>
                    <Input
                      id="concurrency-limit"
                      type="number"
                      min={1}
                      max={100}
                      value={workflow.workflowGlobalConfig.concurrencyLimit}
                      onChange={(e) => updateConfig("concurrencyLimit", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeout">
                      Operation Timeout (ms)
                      <TooltipHelper content="Maximum time for operations to complete" />
                    </Label>
                    <Input
                      id="timeout"
                      type="number"
                      min={1000}
                      step={1000}
                      value={workflow.workflowGlobalConfig.timeoutMs}
                      onChange={(e) => updateConfig("timeoutMs", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-retries">
                      Max Retries
                      <TooltipHelper content="Maximum number of retry attempts for failed operations" />
                    </Label>
                    <Input
                      id="max-retries"
                      type="number"
                      min={0}
                      max={10}
                      value={workflow.workflowGlobalConfig.maxRetries}
                      onChange={(e) => updateConfig("maxRetries", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retry-delay">
                      Retry Delay (ms)
                      <TooltipHelper content="Delay between retry attempts" />
                    </Label>
                    <Input
                      id="retry-delay"
                      type="number"
                      min={1000}
                      step={1000}
                      value={workflow.workflowGlobalConfig.retryDelay}
                      onChange={(e) => updateConfig("retryDelay", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Caching</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cache-enabled"
                      checked={workflow.workflowGlobalConfig.cacheEnabled}
                      onCheckedChange={() => toggleConfig("cacheEnabled")}
                    />
                    <Label htmlFor="cache-enabled">Enable Caching</Label>
                  </div>

                  {workflow.workflowGlobalConfig.cacheEnabled && (
                    <div>
                      <Label htmlFor="cache-ttl">
                        Cache TTL (ms)
                        <TooltipHelper content="Time-to-live for cached data" />
                      </Label>
                      <Input
                        id="cache-ttl"
                        type="number"
                        min={60000}
                        step={60000}
                        value={workflow.workflowGlobalConfig.cacheTTL}
                        onChange={(e) => updateConfig("cacheTTL", Number.parseInt(e.target.value))}
                      />
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="access-control">
                      Access Control Level
                      <TooltipHelper content="Determines who can access this workflow" />
                    </Label>
                    <Select
                      value={workflow.workflowGlobalConfig.accessControl || "standard"}
                      onValueChange={(value) => updateConfig("accessControl", value)}
                    >
                      <SelectTrigger id="access-control">
                        <SelectValue placeholder="Select access control level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="restricted">Restricted</SelectItem>
                        <SelectItem value="confidential">Confidential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="data-retention">
                      Data Retention Period (days)
                      <TooltipHelper content="How long to retain workflow data" />
                    </Label>
                    <Input
                      id="data-retention"
                      type="number"
                      min={30}
                      step={30}
                      value={workflow.workflowGlobalConfig.dataRetentionDays || 365}
                      onChange={(e) => updateConfig("dataRetentionDays", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Security Features</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="encryption-enabled"
                        checked={workflow.workflowGlobalConfig.encryptionEnabled || false}
                        onCheckedChange={() => toggleConfig("encryptionEnabled")}
                      />
                      <Label htmlFor="encryption-enabled">Enable Field Encryption</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="audit-enabled"
                        checked={workflow.workflowGlobalConfig.auditEnabled}
                        onCheckedChange={() => toggleConfig("auditEnabled")}
                      />
                      <Label htmlFor="audit-enabled">Enable Audit Logging</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="integration">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="api-version">
                      API Version
                      <TooltipHelper content="API version to use for external integrations" />
                    </Label>
                    <Select
                      value={workflow.workflowGlobalConfig.apiVersion || "v2"}
                      onValueChange={(value) => updateConfig("apiVersion", value)}
                    >
                      <SelectTrigger id="api-version">
                        <SelectValue placeholder="Select API version" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="v1">v1 (Legacy)</SelectItem>
                        <SelectItem value="v2">v2 (Current)</SelectItem>
                        <SelectItem value="v3">v3 (Beta)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">
                      Webhook URL
                      <TooltipHelper content="URL to send webhook notifications to" />
                    </Label>
                    <Input
                      id="webhook-url"
                      type="url"
                      placeholder="https://example.com/webhook"
                      value={workflow.workflowGlobalConfig.webhookUrl || ""}
                      onChange={(e) => updateConfig("webhookUrl", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Integration Settings</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="webhook-enabled"
                        checked={workflow.workflowGlobalConfig.webhookEnabled || false}
                        onCheckedChange={() => toggleConfig("webhookEnabled")}
                      />
                      <Label htmlFor="webhook-enabled">Enable Webhooks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="external-api-enabled"
                        checked={workflow.workflowGlobalConfig.externalApiEnabled || false}
                        onCheckedChange={() => toggleConfig("externalApiEnabled")}
                      />
                      <Label htmlFor="external-api-enabled">Enable External API Access</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logging">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="logging-level">
                      Logging Level
                      <TooltipHelper content="Determines the verbosity of logs" />
                    </Label>
                    <Select
                      value={workflow.workflowGlobalConfig.loggingLevel}
                      onValueChange={(value) => updateConfig("loggingLevel", value)}
                    >
                      <SelectTrigger id="logging-level">
                        <SelectValue placeholder="Select logging level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="trace">Trace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="log-retention">
                      Log Retention Period (days)
                      <TooltipHelper content="How long to retain logs" />
                    </Label>
                    <Input
                      id="log-retention"
                      type="number"
                      min={7}
                      step={7}
                      value={workflow.workflowGlobalConfig.logRetentionDays || 30}
                      onChange={(e) => updateConfig("logRetentionDays", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Logging Options</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="detailed-logging"
                        checked={workflow.workflowGlobalConfig.detailedLogging || false}
                        onCheckedChange={() => toggleConfig("detailedLogging")}
                      />
                      <Label htmlFor="detailed-logging">Enable Detailed Logging</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="performance-logging"
                        checked={workflow.workflowGlobalConfig.performanceLogging || false}
                        onCheckedChange={() => toggleConfig("performanceLogging")}
                      />
                      <Label htmlFor="performance-logging">Enable Performance Metrics</Label>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default AdvancedConfigForm
