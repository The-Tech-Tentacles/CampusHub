import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { useAuthStore } from "@/stores/auth-store";
import { EmptyState } from "@/components/empty-state";
import emptyStateImage from "@assets/generated_images/Calendar_documents_empty_state_a815655c.png";

export default function Forms() {
  const { user } = useAuthStore();
  const canCreateForm = user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  const forms = [
    {
      id: "1",
      title: "Student Feedback Form - Semester 1",
      description: "Please provide feedback on your learning experience this semester",
      status: "published" as const,
      deadline: "2024-01-25",
      responses: 156,
      totalTargets: 200,
    },
    {
      id: "2",
      title: "Research Project Proposal Submission",
      description: "Submit your research project proposal for final year students",
      status: "published" as const,
      deadline: "2024-01-30",
      responses: 45,
      totalTargets: 80,
    },
    {
      id: "3",
      title: "Internship Details Form",
      description: "Provide details about your summer internship experience",
      status: "published" as const,
      deadline: "2024-02-05",
      responses: 12,
      totalTargets: 150,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Forms</h1>
          <p className="text-muted-foreground">Submit and manage academic forms</p>
        </div>
        {canCreateForm && (
          <Button data-testid="button-create-form">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        )}
      </div>

      <Tabs defaultValue="available" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available" data-testid="tab-available">
            Available Forms
          </TabsTrigger>
          <TabsTrigger value="submitted" data-testid="tab-submitted">
            My Submissions
          </TabsTrigger>
          {canCreateForm && (
            <TabsTrigger value="created" data-testid="tab-created">
              Created by Me
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {forms.map((form) => (
            <Card key={form.id} className="hover-elevate" data-testid={`form-card-${form.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{form.title}</CardTitle>
                        <CardDescription className="mt-1">{form.description}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={form.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(form.deadline).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="outline">
                      {form.responses}/{form.totalTargets} responses
                    </Badge>
                  </div>
                  <Button data-testid={`button-fill-form-${form.id}`}>
                    Fill Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="submitted">
          <EmptyState
            image={emptyStateImage}
            title="No submissions yet"
            description="Forms you've submitted will appear here"
          />
        </TabsContent>

        {canCreateForm && (
          <TabsContent value="created" className="space-y-4">
            {forms.map((form) => (
              <Card key={form.id} data-testid={`form-card-${form.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{form.title}</CardTitle>
                          <CardDescription className="mt-1">{form.description}</CardDescription>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={form.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(form.deadline).toLocaleDateString()}</span>
                      </div>
                      <Badge variant="outline">
                        {form.responses}/{form.totalTargets} responses
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" data-testid="button-view-responses">
                        View Responses
                      </Button>
                      <Button variant="outline" size="sm" data-testid="button-edit-form">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
