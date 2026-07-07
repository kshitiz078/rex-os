import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Cloud } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import * as api from "../services/api";

export default function ContentCalendar() {
  const { calendarEvents, addCalendarEvent, deleteCalendarEvent } = useAppContext();
  
  // Basic date state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState("");

  // Form
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [status, setStatus] = useState("scheduled");
  const [color, setColor] = useState("#ef4444"); // default red

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const handleDayClick = (day: number) => {
    const str = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateStr(str);
    setIsModalOpen(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedDateStr) return;
    addCalendarEvent({ title, date: selectedDateStr, platform, status: status as any, color, isRecurring: false });
    setTitle("");
    setIsModalOpen(false);
  };

  // Build grid
  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDay = (day: number) => {
    const str = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter(e => e.date === str);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-primary" /> Content Calendar
          </h1>
          <p className="text-muted-foreground mt-1 text-lg font-medium">Schedule and track your content drops.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const res = await api.syncCalendar();
              if (res?.success) alert("Google Calendar synced successfully!");
              else alert("Sync failed. Configure Google Calendar ID in Settings first.");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl font-bold text-sm transition-colors border border-blue-500/20"
          >
            <Cloud className="w-4 h-4" /> Sync to Google Calendar
          </button>
          <div className="flex items-center gap-2 bg-secondary/50 p-1.5 rounded-xl border border-border">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={handleToday} className="px-4 py-1.5 font-bold text-sm hover:bg-secondary rounded-lg transition-colors">Today</button>
            <button onClick={handleNextMonth} className="p-2 hover:bg-secondary rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <Card className="border-border/50 bg-card/50 overflow-hidden shadow-xl rounded-2xl">
        <CardHeader className="border-b border-border/50 bg-secondary/20">
          <CardTitle className="text-2xl font-black text-center">{monthName} {year}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border/50 bg-secondary/10">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
            {days.map((day, i) => {
              const isToday = day && new Date().toDateString() === new Date(year, currentDate.getMonth(), day).toDateString();
              const events = day ? getEventsForDay(day) : [];
              return (
                <div
                  key={i}
                  onClick={() => day && handleDayClick(day)}
                  className={`min-h-[120px] p-2 border-r border-b border-border/30 relative transition-colors ${day ? 'hover:bg-secondary/20 cursor-pointer group' : 'bg-secondary/5'} ${i % 7 === 6 ? 'border-r-0' : ''}`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {events.map(e => (
                          <div
                            key={e.id}
                            className="text-[10px] font-bold px-1.5 py-1 rounded border leading-tight truncate relative group/event"
                            style={{ backgroundColor: `${e.color}15`, borderColor: `${e.color}30`, color: e.color }}
                            onClick={(ev) => { ev.stopPropagation(); /* Could add edit functionality here */ }}
                          >
                            {e.title}
                            <button
                              onClick={(ev) => { ev.stopPropagation(); deleteCalendarEvent(e.id); }}
                              className="absolute top-1 right-1 opacity-0 group-hover/event:opacity-100 hover:text-red-500"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* New Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-border/50 bg-card rounded-2xl shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
            <CardHeader>
              <CardTitle className="text-xl font-extrabold">Schedule Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddEvent} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. YouTube Video Drop"
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</label>
                  <input type="date" value={selectedDateStr} onChange={e => setSelectedDateStr(e.target.value)}
                    className="w-full px-3.5 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Platform</label>
                    <select value={platform} onChange={e => {
                      setPlatform(e.target.value);
                      if (e.target.value === 'youtube') setColor('#ef4444');
                      else if (e.target.value === 'spotify') setColor('#22c55e');
                      else if (e.target.value === 'instagram') setColor('#ec4899');
                      else setColor('#3b82f6');
                    }}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="youtube">YouTube</option>
                      <option value="spotify">Spotify</option>
                      <option value="beatstars">BeatStars</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50">
                      <option value="scheduled">Scheduled</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold py-2.5 rounded-lg shadow-lg transition-all mt-2">
                  Add Event
                </button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
