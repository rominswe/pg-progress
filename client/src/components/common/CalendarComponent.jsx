import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, Info } from "lucide-react";
import { formatLocalizedDate } from '@/utils/dateUtils';
import { toast } from 'sonner';

const CalendarComponent = ({ events = [], type = 'master' }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);

    const handleEventClick = (info) => {
        setSelectedEvent(info.event);
    };

    const upcomingEvents = events
        .filter(e => new Date(e.start) >= new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))
        .slice(0, 5);

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            <Card className="shadow-2xl border-none bg-white/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b bg-slate-50/50 p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CalendarIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-800">Academic Calendar</CardTitle>
                            <p className="text-xs text-slate-500 font-medium">Manage and track your research milestones</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 px-3 py-1">Document</Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 px-3 py-1">Defense</Badge>
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 px-3 py-1">Progress</Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 px-3 py-1">Deadline</Badge>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="grid grid-cols-1 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x">
                        {/* Main Calendar View */}
                        <div className="xl:col-span-3 p-4 md:p-6 bg-white min-h-[600px]">
                            <div className="calendar-wrapper h-full">
                                <FullCalendar
                                    plugins={[dayGridPlugin, interactionPlugin]}
                                    initialView="dayGridMonth"
                                    events={events}
                                    eventClick={handleEventClick}
                                    headerToolbar={{
                                        left: 'prev,next today',
                                        center: 'title',
                                        right: 'dayGridMonth,dayGridWeek'
                                    }}
                                    height="auto"
                                    aspectRatio={1.8}
                                    handleWindowResize={true}
                                    eventTimeFormat={{
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        meridiem: 'short'
                                    }}
                                    buttonText={{
                                        today: 'Today',
                                        month: 'Month',
                                        week: 'Week'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Sidebar: Upcoming Events & Details */}
                        <div className="xl:col-span-1 bg-slate-50/30">
                            <div className="p-6 space-y-6 sticky top-0">
                                {/* Selected Event Detail */}
                                <div className="space-y-4">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <Info className="w-4 h-4 text-primary" />
                                        Details
                                    </h4>
                                    {selectedEvent ? (
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                                            <p className="text-sm font-bold text-slate-800 break-words mb-2">{selectedEvent.title}</p>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs font-medium">
                                                    {formatLocalizedDate(selectedEvent.start instanceof Date ? selectedEvent.start.toISOString() : selectedEvent.start)}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => setSelectedEvent(null)}
                                                className="mt-3 text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-tighter"
                                            >
                                                Clear selection
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-100/50 border-2 border-dashed border-slate-200 p-6 rounded-xl text-center">
                                            <p className="text-xs text-slate-400 font-medium">Click an event to view full details</p>
                                        </div>
                                    )}
                                </div>

                                {/* Chronological Milestone List */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        Milestones
                                    </h4>
                                    <div className="space-y-3">
                                        {upcomingEvents.length > 0 ? (
                                            upcomingEvents.map((event, index) => (
                                                <div
                                                    key={index}
                                                    className="flex flex-col gap-1 p-3 rounded-xl border bg-white hover:border-primary/30 hover:shadow-md transition-all duration-200 border-l-4"
                                                    style={{ borderLeftColor: event.color }}
                                                >
                                                    <p className="text-sm font-bold text-slate-800 truncate">{event.title}</p>
                                                    <div className="flex items-center gap-1.5 text-slate-500">
                                                        <Clock className="w-3 h-3" />
                                                        <p className="text-[10px] font-medium">
                                                            {formatLocalizedDate(event.start instanceof Date ? event.start.toISOString() : event.start, 'PP')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-xs text-slate-400 font-italic">No upcoming milestones</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CalendarComponent;
