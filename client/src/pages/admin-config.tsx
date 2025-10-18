import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminConfig() {
  const featureFlags = [
    {
      id: "enableChat",
      title: "Chat Module",
      description: "Enable real-time chat messaging between students and faculty",
      enabled: false,
      status: "Coming Soon" as const,
    },
    {
      id: "enableAttendance",
      title: "QR Attendance",
      description: "Enable QR code-based attendance tracking system",
      enabled: false,
      status: "Coming Soon" as const,
    },
    {
      id: "enableLMS",
      title: "Learning Management System",
      description: "Enable LMS features including materials, assignments, and quizzes",
      enabled: false,
      status: "Coming Soon" as const,
    },
    {
      id: "enableAnalytics",
      title: "Advanced Analytics",
      description: "Enable advanced analytics and reporting dashboards",
      enabled: false,
      status: "Coming Soon" as const,
    },
    {
      id: "enableNotifications",
      title: "Push Notifications",
      description: "Enable push notifications for mobile devices",
      enabled: true,
      status: "Active" as const,
    },
  ];

  const systemSettings = [
    {
      id: "maintenanceMode",
      title: "Maintenance Mode",
      description: "Put the system in maintenance mode for updates",
      enabled: false,
    },
    {
      id: "allowRegistration",
      title: "Allow Self Registration",
      description: "Allow new users to register themselves",
      enabled: false,
    },
    {
      id: "requireEmailVerification",
      title: "Email Verification",
      description: "Require email verification for new accounts",
      enabled: true,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-bold mb-2">System Configuration</h1>
        <p className="text-muted-foreground">Manage system settings and feature flags</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Enable or disable features across the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {featureFlags.map((feature) => (
            <div
              key={feature.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b last:border-0 last:pb-0"
              data-testid={`feature-${feature.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Label htmlFor={feature.id} className="text-base font-medium">
                    {feature.title}
                  </Label>
                  <Badge
                    variant={feature.status === "Active" ? "default" : "secondary"}
                  >
                    {feature.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
              <Switch
                id={feature.id}
                checked={feature.enabled}
                disabled={feature.status === "Coming Soon"}
                data-testid={`switch-${feature.id}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure general system behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {systemSettings.map((setting) => (
            <div
              key={setting.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b last:border-0 last:pb-0"
              data-testid={`setting-${setting.id}`}
            >
              <div className="flex-1">
                <Label htmlFor={setting.id} className="text-base font-medium">
                  {setting.title}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">{setting.description}</p>
              </div>
              <Switch
                id={setting.id}
                checked={setting.enabled}
                data-testid={`switch-${setting.id}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>Recent system configuration changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <div className="rounded-full bg-primary/10 p-2 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Email verification enabled</p>
                <p className="text-muted-foreground">By Admin User • 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="rounded-full bg-muted p-2 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New user created: Dr. Sarah Williams</p>
                <p className="text-muted-foreground">By Admin User • Yesterday</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="rounded-full bg-muted p-2 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Role updated for Michael Chen to HoD</p>
                <p className="text-muted-foreground">By Admin User • 2 days ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button data-testid="button-save-config">Save All Changes</Button>
      </div>
    </div>
  );
}
