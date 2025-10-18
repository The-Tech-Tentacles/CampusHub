import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";

export default function Timetable() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const canManageTimetable =
    user?.role && ["FACULTY", "HOD", "DEAN", "ADMIN"].includes(user.role);

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  const timetable: Record<
    string,
    Record<string, { subject: string; room: string; type: string } | null>
  > = {
    Monday: {
      "9:00 AM": {
        subject: "Data Structures",
        room: "Room 205",
        type: "Lecture",
      },
      "11:00 AM": {
        subject: "Operating Systems",
        room: "Lab 301",
        type: "Lab",
      },
      "2:00 PM": {
        subject: "Database Management",
        room: "Room 104",
        type: "Lecture",
      },
    },
    Tuesday: {
      "10:00 AM": {
        subject: "Computer Networks",
        room: "Room 302",
        type: "Lecture",
      },
      "1:00 PM": {
        subject: "Software Engineering",
        room: "Room 201",
        type: "Lecture",
      },
      "3:00 PM": { subject: "Data Structures", room: "Lab 301", type: "Lab" },
    },
    Wednesday: {
      "9:00 AM": {
        subject: "Database Management",
        room: "Lab 205",
        type: "Lab",
      },
      "12:00 PM": {
        subject: "Computer Architecture",
        room: "Room 105",
        type: "Lecture",
      },
    },
    Thursday: {
      "10:00 AM": {
        subject: "Operating Systems",
        room: "Room 302",
        type: "Lecture",
      },
      "2:00 PM": {
        subject: "Software Engineering",
        room: "Lab 401",
        type: "Lab",
      },
    },
    Friday: {
      "9:00 AM": { subject: "Computer Networks", room: "Lab 303", type: "Lab" },
      "11:00 AM": { subject: "Seminar", room: "Auditorium", type: "Seminar" },
    },
  };

  const typeColors: Record<string, string> = {
    Lecture: "bg-chart-1/20 border-chart-1/30 text-chart-1",
    Lab: "bg-chart-2/20 border-chart-2/30 text-chart-2",
    Seminar: "bg-chart-3/20 border-chart-3/30 text-chart-3",
  };

  return (
    <div className="space-y-6 m-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Back to dashboard */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setLocation("/dashboard")}>
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Dashboard
          </Button>
        </div>
        {canManageTimetable && (
          <Button data-testid="button-manage-timetable">
            <Plus className="h-4 w-4 mr-2" />
            Manage Timetable
          </Button>
        )}
      </div>

      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6 gap-2">
                <div className="font-semibold p-3 text-sm">Time</div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="font-semibold p-3 text-sm text-center"
                  >
                    {day}
                  </div>
                ))}

                {timeSlots.map((time) => (
                  <>
                    <div
                      key={time}
                      className="p-3 text-sm text-muted-foreground border-t"
                    >
                      {time}
                    </div>
                    {days.map((day) => {
                      const slot = timetable[day]?.[time];
                      return (
                        <div
                          key={`${day}-${time}`}
                          className="p-2 border-t min-h-[80px]"
                          data-testid={`slot-${day}-${time}`}
                        >
                          {slot ? (
                            <div
                              className={`p-3 rounded-lg border-2 h-full ${
                                typeColors[slot.type]
                              }`}
                            >
                              <h4 className="font-semibold text-sm mb-1">
                                {slot.subject}
                              </h4>
                              <p className="text-xs opacity-80">{slot.room}</p>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {slot.type}
                              </Badge>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-chart-1/20 border-2 border-chart-1/30" />
              <span className="text-sm">Lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-chart-2/20 border-2 border-chart-2/30" />
              <span className="text-sm">Lab</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-chart-3/20 border-2 border-chart-3/30" />
              <span className="text-sm">Seminar</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
