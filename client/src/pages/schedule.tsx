import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function Schedule() {
  const { user } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const canCreateEvent = user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  const events = [
    {
      id: "1",
      title: "Data Structures - Lecture",
      type: "LECTURE" as const,
      date: "2024-01-15",
      time: "10:00 AM - 11:00 AM",
      location: "Room 205",
      instructor: "Dr. Sarah Johnson",
    },
    {
      id: "2",
      title: "Operating Systems - Lab",
      type: "LAB" as const,
      date: "2024-01-15",
      time: "2:00 PM - 4:00 PM",
      location: "Lab 301",
      instructor: "Prof. Michael Chen",
    },
    {
      id: "3",
      title: "Database Management - Exam",
      type: "EXAM" as const,
      date: "2024-01-18",
      time: "9:00 AM - 12:00 PM",
      location: "Exam Hall A",
      instructor: "Dr. Emily Davis",
    },
    {
      id: "4",
      title: "Guest Lecture on AI",
      type: "GENERIC" as const,
      date: "2024-01-20",
      time: "3:00 PM - 5:00 PM",
      location: "Auditorium",
      instructor: "Prof. David Williams",
    },
  ];

  const typeColors: Record<string, string> = {
    LECTURE: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    LAB: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    EXAM: "bg-destructive/10 text-destructive border-destructive/20",
    GENERIC: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold">Schedule & Events</h1>
          <p className="text-muted-foreground">View your academic calendar and events</p>
        </div>
        {canCreateEvent && (
          <Button data-testid="button-create-event">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousWeek}
                data-testid="button-previous-week"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                data-testid="button-today"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextWeek}
                data-testid="button-next-week"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`p-4 rounded-lg border-2 ${typeColors[event.type]}`}
                data-testid={`event-${event.id}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        📅 {new Date(event.date).toLocaleDateString()} • {event.time}
                      </p>
                      <p className="text-muted-foreground">📍 {event.location}</p>
                      <p className="text-muted-foreground">👤 {event.instructor}</p>
                    </div>
                  </div>
                  {canCreateEvent && (
                    <Button variant="outline" size="sm" data-testid={`button-edit-event-${event.id}`}>
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Mid-Semester Examinations</h4>
                <p className="text-sm text-muted-foreground">Feb 15 - Feb 25, 2024</p>
              </div>
              <Badge>EXAM_PERIOD</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Spring Break</h4>
                <p className="text-sm text-muted-foreground">Mar 1 - Mar 7, 2024</p>
              </div>
              <Badge variant="secondary">HOLIDAY</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <h4 className="font-medium">Semester End</h4>
                <p className="text-sm text-muted-foreground">May 15, 2024</p>
              </div>
              <Badge variant="outline">SEM_END</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
