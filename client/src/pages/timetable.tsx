import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Clock,
  MapPin,
  User,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Badge } from "@/components/ui/badge";
import {
  dataService,
  type Timetable,
  type TimetableSlot,
} from "@/services/dataService";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";

export default function Timetable() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [timetable, setTimetable] = useState<Timetable>({});
  const [todaySchedule, setTodaySchedule] = useState<
    (TimetableSlot & { time: string })[]
  >([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

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
    "5:00 PM",
  ];

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getCurrentDay = () => {
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = new Date().getDay();
    return dayNames[today];
  };

  useEffect(() => {
    const loadTimetableData = async () => {
      try {
        setIsLoading(true);
        const [timetableData, todayData] = await Promise.all([
          dataService.getTimetable(),
          dataService.getTodaySchedule(),
        ]);

        setTimetable(timetableData);
        setTodaySchedule(todayData);

        // Auto-select today if it's a weekday
        const today = getCurrentDay();
        if (days.includes(today)) {
          setSelectedDay(today);
        } else {
          setSelectedDay(days[0]); // Default to Monday
        }
      } catch (error) {
        console.error("Failed to load timetable:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimetableData();
  }, []);

  const getClassTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "lecture":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300";
      case "lab":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300";
      case "seminar":
        return "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950/20 dark:border-gray-800 dark:text-gray-300";
    }
  };

  const getClassTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "lecture":
        return BookOpen;
      case "lab":
        return User;
      case "seminar":
        return Calendar;
      default:
        return Clock;
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8">
      {/* Header with Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        {canManageTimetable && (
          <Button
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
            data-testid="button-manage-timetable"
          >
            <Plus className="h-4 w-4 mr-2" />
            Manage Timetable
          </Button>
        )}
      </div>

      {/* Today's Schedule Card */}
      {todaySchedule.length > 0 && (
        <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Clock className="h-5 w-5" />
              Today's Classes ({getCurrentDay()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {todaySchedule.map((classItem, index) => {
                const Icon = getClassTypeIcon(classItem.type);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${getClassTypeColor(
                      classItem.type
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {classItem.time}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {classItem.type}
                      </Badge>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">
                      {classItem.subject}
                    </h4>
                    <div className="flex items-center gap-1 text-xs opacity-75">
                      <MapPin className="h-3 w-3" />
                      <span>{classItem.room}</span>
                    </div>
                    {classItem.faculty && (
                      <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
                        <User className="h-3 w-3" />
                        <span>{classItem.faculty}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day Selector for Mobile */}
      <div className="block md:hidden">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Select Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className={
                    selectedDay === day
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      : ""
                  }
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Timetable Grid */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="grid grid-cols-6">
                <div className="sticky left-0 bg-muted/50 font-semibold p-4 text-sm border-b border-r">
                  Time
                </div>
                {days.map((day) => (
                  <div
                    key={day}
                    className="font-semibold p-4 text-sm text-center border-b bg-muted/30"
                  >
                    {day}
                  </div>
                ))}

                {timeSlots.map((time) => (
                  <>
                    <div
                      key={time}
                      className="sticky left-0 bg-muted/30 p-4 text-sm text-muted-foreground border-r border-b"
                    >
                      {time}
                    </div>
                    {days.map((day) => {
                      const slot = timetable[day]?.[time];
                      return (
                        <div
                          key={`${day}-${time}`}
                          className="p-3 border-b border-r min-h-[100px] hover:bg-muted/20 transition-colors"
                          data-testid={`slot-${day}-${time}`}
                        >
                          {slot ? (
                            <div
                              className={`p-3 rounded-lg border-2 h-full transition-all hover:shadow-sm ${getClassTypeColor(
                                slot.type
                              )}`}
                            >
                              <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                                {slot.subject}
                              </h4>
                              <div className="flex items-center gap-1 text-xs opacity-75 mb-2">
                                <MapPin className="h-3 w-3" />
                                <span>{slot.room}</span>
                              </div>
                              {slot.faculty && (
                                <div className="flex items-center gap-1 text-xs opacity-75 mb-2">
                                  <User className="h-3 w-3" />
                                  <span className="line-clamp-1">
                                    {slot.faculty}
                                  </span>
                                </div>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {slot.type}
                              </Badge>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center opacity-30">
                              <span className="text-xs">Free</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden p-4">
            {selectedDay && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-4">{selectedDay}</h3>
                {timeSlots.map((time) => {
                  const slot = timetable[selectedDay]?.[time];
                  return (
                    <div
                      key={time}
                      className="flex gap-4 p-3 border rounded-lg"
                    >
                      <div className="text-sm text-muted-foreground min-w-[70px]">
                        {time}
                      </div>
                      <div className="flex-1">
                        {slot ? (
                          <div
                            className={`p-3 rounded-lg border-2 ${getClassTypeColor(
                              slot.type
                            )}`}
                          >
                            <h4 className="font-semibold text-sm mb-1">
                              {slot.subject}
                            </h4>
                            <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                              <MapPin className="h-3 w-3" />
                              <span>{slot.room}</span>
                            </div>
                            {slot.faculty && (
                              <div className="flex items-center gap-1 text-xs opacity-75 mb-2">
                                <User className="h-3 w-3" />
                                <span>{slot.faculty}</span>
                              </div>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {slot.type}
                            </Badge>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground italic">
                            No class scheduled
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Legend Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Class Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <div className="w-4 h-4 rounded bg-blue-50 border-2 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800" />
              <span className="text-sm">Lecture</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              <div className="w-4 h-4 rounded bg-green-50 border-2 border-green-200 dark:bg-green-950/20 dark:border-green-800" />
              <span className="text-sm">Lab</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <div className="w-4 h-4 rounded bg-purple-50 border-2 border-purple-200 dark:bg-purple-950/20 dark:border-purple-800" />
              <span className="text-sm">Seminar</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
