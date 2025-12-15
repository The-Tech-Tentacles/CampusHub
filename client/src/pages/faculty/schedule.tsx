import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Event } from "@/services/dataService";
import {
  Plus,
  Calendar as CalendarIcon,
  MapPin,
  Users,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Presentation,
  Trophy,
  Palette,
  Grid3x3,
  Sun,
  Edit,
  Trash2,
  Link as LinkIcon,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Unified event form data interface
interface EventFormData {
  title: string;
  description: string;
  eventCategory: "REGULAR" | "ACADEMIC";
  type: string;
  customType: string;
  startDate: string;
  endDate: string;
  location: string;
  instructor: string;
  isHoliday: boolean;
  academicYear: number;
  semester: 1 | 2 | null;
  linkUrl: string;
  targetYears: string[];
  targetDepartments: string[];
  targetRoles: string[];
  targetScope: "GLOBAL" | "DEPARTMENT";
}

export default function FacultySchedule() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [eventFilter, setEventFilter] = useState<
    "ALL" | "REGULAR" | "ACADEMIC"
  >("ALL");

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventCategory: "REGULAR",
    type: "GENERIC",
    customType: "",
    startDate: "",
    endDate: "",
    location: "",
    instructor: "",
    isHoliday: false,
    academicYear: new Date().getFullYear(),
    semester: null,
    linkUrl: "",
    targetYears: [],
    targetDepartments: [],
    targetRoles: [],
    targetScope: "GLOBAL",
  });

  // Set default target role for faculty users
  useEffect(() => {
    if (user?.role === "FACULTY" && formData.targetRoles.length === 0) {
      setFormData((prev) => ({
        ...prev,
        targetRoles: ["STUDENT"],
      }));
    }
  }, [user]);

  useEffect(() => {
    loadEvents();
    loadAcademicYearsAndDepartments();
  }, []);

  const loadAcademicYearsAndDepartments = async () => {
    try {
      const [yearsRes, deptsRes] = await Promise.all([
        api.getAcademicYears(),
        api.getDepartments(),
      ]);

      if (yearsRes.success && yearsRes.data) {
        setAcademicYears(yearsRes.data);
      }
      if (deptsRes.success && deptsRes.data) {
        setDepartments(deptsRes.data);
      }
    } catch (error) {
      console.error("Error loading academic years/departments:", error);
    }
  };

  // Auto-populate faculty department and STUDENT role when switching to DEPARTMENT targeting
  useEffect(() => {
    if (formData.targetScope === "DEPARTMENT" && user?.role === "FACULTY") {
      const updates: any = {};

      // Default to STUDENT role for faculty
      if (formData.targetRoles.length === 0) {
        updates.targetRoles = ["STUDENT"];
      }

      // Default to faculty's department
      if (user?.departmentId && formData.targetDepartments.length === 0) {
        updates.targetDepartments = [user.departmentId];
      }

      if (Object.keys(updates).length > 0) {
        setFormData((prev) => ({ ...prev, ...updates }));
      }
    }
  }, [formData.targetScope, user]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const [allEventsRes, myEventsRes] = await Promise.all([
        api.getEvents(),
        api.getMyEvents(),
      ]);

      if (allEventsRes.success && allEventsRes.data) {
        setAllEvents(allEventsRes.data as Event[]);
      }
      if (myEventsRes.success && myEventsRes.data) {
        setMyEvents(myEventsRes.data as Event[]);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !formData.startDate || !formData.endDate) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate custom type when OTHER is selected
    if (formData.type === "OTHER" && !formData.customType.trim()) {
      toast({
        title: "Validation Error",
        description: "Please specify the custom event type",
        variant: "destructive",
      });
      return;
    }

    // Validate years - always required
    if (formData.targetYears.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one target year",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare event data, using customType when type is "OTHER"
      const eventData = {
        ...formData,
        type:
          formData.type === "OTHER"
            ? formData.customType.trim()
            : formData.type,
      };

      // Remove customType from the payload since backend doesn't expect it
      const { customType, ...backendData } = eventData;

      const response = await api.createEvent(backendData);

      if (response.success) {
        toast({
          title: "Success",
          description: "Event created successfully",
        });
        setIsEventDialogOpen(false);
        resetForm();
        loadEvents();
      } else {
        throw new Error(response.message || "Failed to create event");
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const response = await api.deleteEvent(eventId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        await loadEvents();
      } else {
        throw new Error(response.message || "Failed to delete event");
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      eventCategory: "REGULAR",
      type: "GENERIC",
      customType: "",
      startDate: "",
      endDate: "",
      location: "",
      instructor: "",
      isHoliday: false,
      academicYear: new Date().getFullYear(),
      semester: null,
      linkUrl: "",
      targetYears: [],
      targetDepartments: [],
      targetRoles: user?.role === "FACULTY" ? ["STUDENT"] : [],
      targetScope: "GLOBAL",
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "LECTURE":
        return <BookOpen className="h-4 w-4" />;
      case "LAB":
        return <FlaskConical className="h-4 w-4" />;
      case "EXAM":
        return <GraduationCap className="h-4 w-4" />;
      case "SEMINAR":
        return <Presentation className="h-4 w-4" />;
      case "WORKSHOP":
        return <Users className="h-4 w-4" />;
      case "SPORTS":
        return <Trophy className="h-4 w-4" />;
      case "CULTURAL":
        return <Palette className="h-4 w-4" />;
      default:
        return <Grid3x3 className="h-4 w-4" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "LECTURE":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "LAB":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "EXAM":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
      case "SEMINAR":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "WORKSHOP":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300";
      case "SPORTS":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "CULTURAL":
        return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Filter events based on search term and category filter
  const filterEvents = (events: Event[]) => {
    return events.filter((event) => {
      const matchesSearch =
        searchTerm === "" ||
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        eventFilter === "ALL" || event.eventCategory === eventFilter;

      return matchesSearch && matchesFilter;
    });
  };

  const filteredAllEvents = filterEvents(allEvents);
  const filteredMyEvents = filterEvents(myEvents);

  const EventCard = ({
    event,
    showActions = false,
  }: {
    event: Event;
    showActions?: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getEventTypeColor(event.type)}>
                {getEventTypeIcon(event.type)}
                <span className="ml-1">{event.type}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                <CalendarIcon className="h-3 w-3 mr-1" />
                {format(new Date(event.startDate), "MMM dd, yyyy")}
                {event.startDate !== event.endDate &&
                  ` - ${format(new Date(event.endDate), "MMM dd, yyyy")}`}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">
              {event.title}
            </CardTitle>
          </div>
          {showActions && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleDeleteEvent(event.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="flex flex-col gap-2 text-sm">
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          {event.instructor && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{event.instructor}</span>
            </div>
          )}
          {event.linkUrl && (
            <a
              href={event.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <LinkIcon className="h-4 w-4" />
              <span>View Link</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              Schedule Management
            </h1>
          </div>
        </div>
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => setIsEventDialogOpen(true)}
          className="gap-2 w-full"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={eventFilter}
                onValueChange={(v) =>
                  setEventFilter(v as "ALL" | "REGULAR" | "ACADEMIC")
                }
              >
                <SelectTrigger className="gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">
                    <div className="flex items-center gap-2">
                      {/* <Filter className="h-4 w-4" /> */}
                      <span>All Events</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="REGULAR">
                    <div className="flex items-center gap-2">
                      {/* <CalendarIcon className="h-4 w-4" /> */}
                      <span>Regular Events</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ACADEMIC">
                    <div className="flex items-center gap-2">
                      {/* <Sun className="h-4 w-4" /> */}
                      <span>Academic Events</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="all" className="gap-2">
            <Grid3x3 className="h-4 w-4" />
            All Events
            {!loading && (
              <Badge variant="secondary">{filteredAllEvents.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="mine" className="gap-2">
            <Users className="h-4 w-4" />
            My Events
            {!loading && (
              <Badge variant="secondary">{filteredMyEvents.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredAllEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {searchTerm || eventFilter !== "ALL"
                    ? "No events found"
                    : "No events scheduled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || eventFilter !== "ALL"
                    ? "Try adjusting your search or filters"
                    : "Create your first event to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAllEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : filteredMyEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">
                  {searchTerm || eventFilter !== "ALL"
                    ? "No events found"
                    : "You haven't created any events yet"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || eventFilter !== "ALL"
                    ? "Try adjusting your search or filters"
                    : ""}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMyEvents.map((event) => (
                <EventCard key={event.id} event={event} showActions />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Unified Create Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Create a regular event or academic calendar event
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Event Category */}
            <div className="space-y-2">
              <Label>Event Category *</Label>
              <Select
                value={formData.eventCategory}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    eventCategory: v as "REGULAR" | "ACADEMIC",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="REGULAR">Regular Event</SelectItem>
                  <SelectItem value="ACADEMIC">Academic Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Event title"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Event description"
                rows={3}
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.eventCategory === "REGULAR" ? (
                    <>
                      <SelectItem value="LECTURE">Lecture</SelectItem>
                      <SelectItem value="LAB">Lab</SelectItem>
                      <SelectItem value="EXAM">Exam</SelectItem>
                      <SelectItem value="SEMINAR">Seminar</SelectItem>
                      <SelectItem value="WORKSHOP">Workshop</SelectItem>
                      <SelectItem value="SPORTS">Sports</SelectItem>
                      <SelectItem value="CULTURAL">Cultural</SelectItem>
                      <SelectItem value="GENERIC">Generic</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="SEMESTER_START">
                        Semester Start
                      </SelectItem>
                      <SelectItem value="SEMESTER_END">Semester End</SelectItem>
                      <SelectItem value="EXAM_WEEK">Exam Week</SelectItem>
                      <SelectItem value="HOLIDAY">Holiday</SelectItem>
                      <SelectItem value="REGISTRATION">Registration</SelectItem>
                      <SelectItem value="ORIENTATION">Orientation</SelectItem>
                      <SelectItem value="BREAK">Break</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Type Input - shown when OTHER is selected */}
            {formData.type === "OTHER" && (
              <div className="space-y-2">
                <Label>Custom Event Type *</Label>
                <Input
                  value={formData.customType}
                  onChange={(e) =>
                    setFormData({ ...formData, customType: e.target.value })
                  }
                  placeholder="Enter custom event type (e.g., Hackathon, Blood Donation)"
                />
              </div>
            )}

            {/* Date Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Regular Event Fields */}
            {formData.eventCategory === "REGULAR" && (
              <>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="Room 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Input
                    value={formData.instructor}
                    onChange={(e) =>
                      setFormData({ ...formData, instructor: e.target.value })
                    }
                    placeholder="Dr. Smith"
                  />
                </div>
              </>
            )}

            {/* Academic Event Fields */}
            {formData.eventCategory === "ACADEMIC" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Academic Year *</Label>
                    <Input
                      type="number"
                      value={formData.academicYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          academicYear: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select
                      value={formData.semester?.toString() || "none"}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          semester:
                            v === "none" ? null : (parseInt(v) as 1 | 2),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Semester</SelectItem>
                        <SelectItem value="1">Semester 1</SelectItem>
                        <SelectItem value="2">Semester 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="is-holiday"
                    type="checkbox"
                    checked={formData.isHoliday}
                    onChange={(e) =>
                      setFormData({ ...formData, isHoliday: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <Label htmlFor="is-holiday" className="cursor-pointer">
                    Mark as Holiday
                  </Label>
                </div>
              </>
            )}

            {/* Target Years - Always Required */}
            <div className="space-y-2">
              <Label>Target Years * (Select from academic years)</Label>
              <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                {academicYears.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Loading academic years...
                  </p>
                ) : (
                  academicYears.map((year) => (
                    <label
                      key={year.id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetYears.includes(year.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              targetYears: [...formData.targetYears, year.id],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              targetYears: formData.targetYears.filter(
                                (y) => y !== year.id
                              ),
                            });
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {year.name} ({year.code})
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Target Scope */}
            <div className="space-y-2">
              <Label>Event Visibility</Label>
              <Select
                value={formData.targetScope}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    targetScope: v as "GLOBAL" | "DEPARTMENT",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global (All Users)</SelectItem>
                  <SelectItem value="DEPARTMENT">
                    Department Specific
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Departments - Show only when DEPARTMENT is selected */}
            {formData.targetScope === "DEPARTMENT" && (
              <div className="space-y-2">
                <Label>Target Departments *</Label>
                {user?.role === "FACULTY" && user?.departmentId ? (
                  <div className="border rounded-md p-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="h-4 w-4"
                      />
                      <span className="text-sm">
                        {user.department || "Your Department"} (Fixed)
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Faculty members can only create events for their own
                      department
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                    {departments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Loading departments...
                      </p>
                    ) : (
                      <>
                        {formData.targetDepartments.length > 0 && (
                          <div className="mb-2 pb-2 border-b">
                            <p className="text-xs font-medium text-muted-foreground mb-1">
                              Selected:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {formData.targetDepartments.map((deptId) => {
                                const dept = departments.find(
                                  (d) => d.id === deptId
                                );
                                return dept ? (
                                  <span
                                    key={deptId}
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                  >
                                    {dept.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                        {departments.map((dept) => (
                          <label
                            key={dept.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={formData.targetDepartments.includes(
                                dept.id
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    targetDepartments: [
                                      ...formData.targetDepartments,
                                      dept.id,
                                    ],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    targetDepartments:
                                      formData.targetDepartments.filter(
                                        (d) => d !== dept.id
                                      ),
                                  });
                                }
                              }}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">
                              {dept.name} ({dept.code})
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Link</Label>
              <Input
                type="url"
                value={formData.linkUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkUrl: e.target.value })
                }
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEventDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
