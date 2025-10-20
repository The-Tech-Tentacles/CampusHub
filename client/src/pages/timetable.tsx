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
    "9:15 AM",
    "10:15 AM",
    "11:15 AM",
    "11:30 AM",
    "12:30 PM",
    "1:30 PM",
    "2:15 PM",
    "3:15 PM",
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

  // Helper function to calculate end time based on class type
  const getEndTime = (startTime: string, classType: string) => {
    const isLab = classType === "Lab";
    const hoursToAdd = isLab ? 2 : 1;

    // Parse start time
    const [time, period] = startTime.split(" ");
    const [hours, minutes] = time.split(":").map(Number);

    // Convert to 24-hour format
    let hour24 = hours;
    if (period === "PM" && hours !== 12) hour24 += 12;
    if (period === "AM" && hours === 12) hour24 = 0;

    // Add duration
    hour24 += hoursToAdd;

    // Convert back to 12-hour format
    const endPeriod = hour24 >= 12 ? "PM" : "AM";
    let endHour = hour24 > 12 ? hour24 - 12 : hour24;
    if (endHour === 0) endHour = 12;

    return `${endHour}:${minutes.toString().padStart(2, "0")} ${endPeriod}`;
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

      {/* Weekly Timetable Grid */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        {/* Day Selector for Mobile */}
        <div className="block md:hidden border-b border-border/50">
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {days.map((day) => (
                <Button
                  key={day}
                  variant={selectedDay === day ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className={`
                    min-w-[30px] flex-1 max-w-[80px] text-xs font-medium transition-all duration-200
                    ${
                      selectedDay === day
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md hover:shadow-lg"
                        : "hover:bg-secondary/80"
                    }
                  `}
                >
                  {day.slice(0, 3)}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-6">
                {days.map((day) => (
                  <div
                    key={day}
                    className="font-semibold p-4 text-sm text-center border-b bg-muted/30"
                  >
                    {day}
                  </div>
                ))}

                {timeSlots.map((time, timeIndex) => {
                  // Helper function to check if next slot should be skipped for this day
                  const getNextTimeSlot = (currentIndex: number) => {
                    return currentIndex + 1 < timeSlots.length
                      ? timeSlots[currentIndex + 1]
                      : null;
                  };

                  // Helper function to check if current slot is continuation of a lab
                  const isLabContinuation = (
                    day: string,
                    currentTime: string,
                    timeIdx: number
                  ) => {
                    if (timeIdx === 0) return false;
                    const prevTime = timeSlots[timeIdx - 1];
                    const prevSlot = timetable[day]?.[prevTime];
                    const currentSlot = timetable[day]?.[currentTime];

                    return (
                      prevSlot?.type === "Lab" &&
                      (!currentSlot || currentSlot.type !== "Lab") &&
                      prevSlot?.subject &&
                      (currentSlot?.subject === prevSlot.subject ||
                        !currentSlot)
                    );
                  };

                  return (
                    <>
                      {days.map((day) => {
                        const slot = timetable[day]?.[time];
                        const nextTime = getNextTimeSlot(timeIndex);
                        const nextSlot = nextTime
                          ? timetable[day]?.[nextTime]
                          : null;

                        // Check if this is a lab continuation slot
                        if (isLabContinuation(day, time, timeIndex)) {
                          return (
                            <div
                              key={`${day}-${time}`}
                              className="p-3 border-b border-r min-h-[100px] bg-muted/10"
                              data-testid={`slot-${day}-${time}`}
                            >
                              <div className="h-full flex items-center justify-center opacity-50">
                                <span className="text-xs text-muted-foreground">
                                  Lab continues...
                                </span>
                              </div>
                            </div>
                          );
                        }

                        // Determine if this lab spans to next slot
                        const isLabSpanning =
                          slot?.type === "Lab" &&
                          nextTime &&
                          (!nextSlot ||
                            nextSlot.type !== "Lab" ||
                            nextSlot.subject === slot.subject);

                        return (
                          <div
                            key={`${day}-${time}`}
                            className={`p-3 border-b border-r min-h-[100px] hover:bg-muted/20 transition-colors ${
                              isLabSpanning ? "relative" : ""
                            }`}
                            data-testid={`slot-${day}-${time}`}
                          >
                            {slot ? (
                              <div
                                className={`p-3 rounded-lg border-2 h-full transition-all hover:shadow-sm ${getClassTypeColor(
                                  slot.type
                                )} ${isLabSpanning ? "relative z-10" : ""}`}
                              >
                                <h4 className="font-semibold text-sm mb-1 line-clamp-2">
                                  {slot.subject}
                                </h4>
                                <div className="flex items-center gap-1 text-xs opacity-75 mb-2">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {time} - {getEndTime(time, slot.type)}
                                  </span>
                                </div>
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
                                {/* Visual indicator for lab spanning */}
                                {isLabSpanning && (
                                  <div className="absolute -bottom-3 left-3 right-3 h-2 bg-gradient-to-b from-current/20 to-transparent rounded-b-lg pointer-events-none" />
                                )}
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
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden p-4">
            {selectedDay && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg mb-4">{selectedDay}</h3>
                {timeSlots.map((time, timeIndex) => {
                  const slot = timetable[selectedDay]?.[time];

                  // Check if this is a lab continuation slot
                  const isLabContinuation =
                    timeIndex > 0 &&
                    timeSlots[timeIndex - 1] &&
                    timetable[selectedDay]?.[timeSlots[timeIndex - 1]]?.type ===
                      "Lab" &&
                    (!slot || slot.type !== "Lab");

                  // Skip rendering lab continuation slots in mobile view
                  if (isLabContinuation) {
                    return null;
                  }

                  return (
                    <div
                      key={time}
                      className="flex gap-4 p-0 border rounded-lg"
                    >
                      <div className="flex-1">
                        {slot ? (
                          <div
                            className={`p-3 rounded-lg border-2 ${getClassTypeColor(
                              slot.type
                            )}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-sm">
                                {slot.subject}
                              </h4>
                              <Badge variant="secondary" className="text-xs">
                                {slot.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {time} - {getEndTime(time, slot.type)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs opacity-75 mb-1">
                              <MapPin className="h-3 w-3" />
                              <span>{slot.room}</span>
                            </div>
                            {slot.faculty && (
                              <div className="flex items-center gap-1 text-xs opacity-75">
                                <User className="h-3 w-3" />
                                <span>{slot.faculty}</span>
                              </div>
                            )}
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
