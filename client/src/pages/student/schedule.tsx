import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  User,
  BookOpen,
  GraduationCap,
  Sparkles,
  Trophy,
  Music,
  FlaskConical,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useLocation } from "wouter";
import {
  dataService,
  type Event,
  type AcademicEvent,
  type EventType,
  type AcademicEventType,
} from "@/services/dataService";

export default function Schedule() {
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    loadScheduleData();
  }, [currentMonth, currentYear]);

  const loadScheduleData = async () => {
    try {
      setIsLoading(true);
      console.log("[STUDENT SCHEDULE] Loading data for:", {
        month: currentMonth + 1,
        year: currentYear,
        user: user?.id,
        role: user?.role,
      });

      const [eventsData, academicData] = await Promise.all([
        dataService.getEvents({
          month: currentMonth + 1, // JavaScript months are 0-indexed, API expects 1-indexed
          year: currentYear,
        }),
        dataService.getAcademicEvents({
          month: currentMonth + 1,
          year: currentYear,
        }),
      ]);

      console.log("[STUDENT SCHEDULE] Data loaded:", {
        events: eventsData.length,
        academicEvents: academicData.length,
      });

      // Sort events by date and time (earliest to latest)
      const sortedEvents = [...eventsData].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });

      // Sort academic events by start date (earliest to latest)
      const sortedAcademicEvents = [...academicData].sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateA.getTime() - dateB.getTime();
      });

      setEvents(sortedEvents);
      setAcademicEvents(sortedAcademicEvents);
    } catch (error) {
      console.error("[STUDENT SCHEDULE] Failed to load schedule data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case "LECTURE":
        return BookOpen;
      case "LAB":
        return FlaskConical;
      case "EXAM":
        return GraduationCap;
      case "SEMINAR":
        return User;
      case "WORKSHOP":
        return BookOpen;
      case "SPORTS":
        return Trophy;
      case "CULTURAL":
        return Music;
      default:
        return Calendar;
    }
  };

  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case "LECTURE":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300";
      case "LAB":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300";
      case "EXAM":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300";
      case "SEMINAR":
        return "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300";
      case "WORKSHOP":
        return "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-300";
      case "SPORTS":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-300";
      case "CULTURAL":
        return "bg-pink-50 border-pink-200 text-pink-800 dark:bg-pink-950/20 dark:border-pink-800 dark:text-pink-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950/20 dark:border-gray-800 dark:text-gray-300";
    }
  };

  const getAcademicEventColor = (
    type: AcademicEventType,
    isHoliday: boolean
  ) => {
    if (isHoliday) {
      return "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/20 dark:border-red-800 dark:text-red-300";
    }

    switch (type) {
      case "SEMESTER_START":
      case "SEMESTER_END":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/20 dark:border-green-800 dark:text-green-300";
      case "EXAM_WEEK":
        return "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950/20 dark:border-orange-800 dark:text-orange-300";
      case "REGISTRATION":
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-300";
      case "ORIENTATION":
        return "bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950/20 dark:border-purple-800 dark:text-purple-300";
      case "BREAK":
        return "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-950/20 dark:border-indigo-800 dark:text-indigo-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950/20 dark:border-gray-800 dark:text-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-2 md:p-6">
      {/* Month Navigation */}
      <Card className="border-2 border-indigo-200/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 dark:border-indigo-800/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-1 text-indigo-900 dark:text-indigo-100">
              <Calendar className="h-6 w-6" />
              <span className="text-2xl font-bold">
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={previousMonth}
                className="border-indigo-200 hover:bg-indigo-100 dark:border-indigo-800 dark:hover:bg-indigo-950/30"
                data-testid="button-previous-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                className="border-indigo-200 hover:bg-indigo-100 dark:border-indigo-800 dark:hover:bg-indigo-950/30"
                data-testid="button-next-month"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for Events and Academic Calendar */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="academic" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Academic
          </TabsTrigger>
        </TabsList>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          {events.length === 0 ? (
            <EmptyState
              title="No events this month"
              description="There are no events scheduled for this month. Check back later for upcoming events."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => {
                const Icon = getEventTypeIcon(event.type);
                const eventDate = new Date(event.date);

                return (
                  <Card
                    key={event.id}
                    className={`overflow-hidden transition-all hover:shadow-md border-2 ${getEventTypeColor(
                      event.type
                    )}`}
                    data-testid={`event-${event.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <Badge variant="secondary" className="text-xs">
                            {event.type}
                          </Badge>
                        </div>
                      </div>

                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{eventDate.toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {event.startTime} - {event.endTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>

                        {event.instructor && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="line-clamp-1">
                              {event.instructor}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Academic Calendar Tab */}
        <TabsContent value="academic" className="space-y-4">
          {academicEvents.length === 0 ? (
            <EmptyState
              title="No academic events this month"
              description="There are no academic calendar events for this month."
            />
          ) : (
            <div className="space-y-4">
              {academicEvents.map((event) => {
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                const isMultiDay =
                  startDate.toDateString() !== endDate.toDateString();

                return (
                  <Card
                    key={event.id}
                    className={`transition-all hover:shadow-md border-2 ${getAcademicEventColor(
                      event.type,
                      event.isHoliday
                    )}`}
                    data-testid={`academic-event-${event.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">
                              {event.title}
                            </h3>
                            {event.isHoliday && (
                              <Badge variant="destructive" className="text-xs">
                                Holiday
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {event.type.replace(/_/g, " ")}
                            </Badge>
                          </div>

                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {event.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {isMultiDay
                                  ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                                  : startDate.toLocaleDateString()}
                              </span>
                            </div>

                            {event.semester && (
                              <Badge variant="secondary" className="text-xs">
                                Semester {event.semester}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
