import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { MessageCard } from "@/components/ui/message-card";
import { CalendarIcon, Clock, Mic } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SelfCare() {
  const [date, setDate] = useState<Date>();
  const [messages, setMessages] = useState<any[]>([
    {
      id: 1,
      message: "Remember to take a moment for yourself today. Breathe deeply and appreciate the journey you're on.",
      scheduledFor: new Date(Date.now() + 86400000),
      repeat: "Daily",
      voiceNote: null,
    },
    {
      id: 2,
      message: "You're stronger than you know. Today's challenges are tomorrow's strengths.",
      scheduledFor: new Date(Date.now() + 172800000),
      repeat: "Weekly",
      voiceNote: null,
    },
    {
      id: 3,
      message: "Take time to nourish your body and mind today. You deserve care and attention.",
      scheduledFor: new Date(Date.now() + 259200000),
      repeat: "Monthly",
      voiceNote: null,
    }
  ]);
  
  const [message, setMessage] = useState("");
  const [time, setTime] = useState("");
  const [repeat, setRepeat] = useState("never");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messages.forEach((msg) => {
      const timeout = msg.scheduledFor - new Date();
      if (timeout > 0) {
        setTimeout(() => {
          alertMessage(msg);
        }, timeout);
      }
    });
  }, [messages]);

  const alertMessage = (msg: any) => {
    toast(`Message: ${msg.message}`, {
      duration: 8000,
      action: msg.voiceNote && (
        <audio controls>
          <source src={URL.createObjectURL(msg.voiceNote)} type="audio/webm" />
          Your browser does not support the audio element.
        </audio>
      )
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message || !date || !time) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Create scheduled date by combining date and time
    const scheduledDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    scheduledDate.setHours(hours, minutes);
    
    if (scheduledDate < new Date()) {
      toast.error("Please select a future date and time");
      return;
    }

    const newMessage = {
      id: editId || Date.now(),
      message,
      scheduledFor: scheduledDate,
      repeat: repeat !== "never" ? repeat : undefined,
      voiceNote,
    };

    if (isEditing && editId !== null) {
      setMessages(messages.map(msg => (msg.id === editId ? newMessage : msg)));
      toast.success("Self-care message updated successfully!");
    } else {
      setMessages([newMessage, ...messages]);
      toast.success("Self-care message scheduled successfully!");
    }

    // Reset form
    setMessage("");
    setDate(undefined);
    setTime("");
    setRepeat("never");
    setIsEditing(false);
    setEditId(null);
    setVoiceNote(null);
  };

  const handleEdit = (id: number) => {
    const msg = messages.find(m => m.id === id);
    if (msg) {
      setMessage(msg.message);
      setDate(new Date(msg.scheduledFor));
      setTime(format(new Date(msg.scheduledFor), "HH:mm"));
      setRepeat(msg.repeat || "never");
      setIsEditing(true);
      setEditId(id);
      setVoiceNote(msg.voiceNote);
    }
  };

  const handleDelete = (id: number) => {
    setMessages(messages.filter(m => m.id !== id));
    toast.success("Message deleted successfully");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => setVoiceNote(new Blob(chunks, { type: 'audio/webm' }));
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      toast.error("Failed to start recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
      setRecording(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("ended", () => URL.revokeObjectURL(audioRef.current!.src));
    }
  }, []);

  const activities = [
    { name: "5-Minute Meditation", duration: "5 min", category: "Mindfulness" },
    { name: "Stretching Routine", duration: "10 min", category: "Physical" },
    { name: "Gratitude Journaling", duration: "15 min", category: "Mental" },
    { name: "Deep Breathing Exercise", duration: "3 min", category: "Stress Relief" },
    { name: "Positive Affirmations", duration: "5 min", category: "Emotional" },
    { name: "Self-Massage Techniques", duration: "10 min", category: "Physical" }
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-10 animate-fadeIn">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-brand">"Her Voice" Self-Care Messages</h1>
        </div>
        
        <Tabs defaultValue="create" className="w-full animate-slideUp">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 mb-8">
            <TabsTrigger value="create">Create Message</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Messages</TabsTrigger>
            <TabsTrigger value="activities">Self-Care Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="mt-0">
            <Card className="border border-border/40 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">{isEditing ? "Edit Self-Care Message" : "Create a Self-Care Message"}</h2>
                    <p className="text-muted-foreground mb-6">Schedule a message to your future self for motivation and self-care</p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="message">Your Message</Label>
                        <Textarea 
                          id="message"
                          placeholder="Write a supportive message to your future self..."
                          className="min-h-[150px] resize-none mt-1"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="voiceNote">Voice Note</Label>
                        <div className="flex items-center mt-1">
                          <Button
                            type="button"
                            variant={recording ? "danger" : "outline"}
                            onClick={recording ? stopRecording : startRecording}
                            className="flex-1"
                          >
                            {recording ? "Stop Recording" : "Start Recording"}
                            <Mic className="ml-2 h-4 w-4" />
                          </Button>
                          {voiceNote && (
                            <audio controls className="ml-4">
                              <source src={URL.createObjectURL(voiceNote)} type="audio/webm" />
                              Your browser does not support the audio element.
                            </audio>
                          )}
                        </div>
                      </div>
                    </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="date">Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal mt-1",
                                  !date && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 pointer-events-auto">
                              <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div>
                          <Label htmlFor="time">Time</Label>
                          <div className="flex items-center mt-1">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="time"
                              id="time"
                              className="flex-1"
                              value={time}
                              onChange={(e) => setTime(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="repeat">Repeat</Label>
                        <Select value={repeat} onValueChange={setRepeat}>
                          <SelectTrigger className="w-full mt-1">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" className="bg-brand hover:bg-brand-600 text-white">
                      {isEditing ? "Update Message" : "Schedule Message"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scheduled" className="mt-0">
            <h2 className="text-2xl font-semibold mb-6">Your Scheduled Messages</h2>
            
            {messages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 staggered">
                {messages.map((msg) => (
                  <MessageCard
                    key={msg.id}
                    message={msg.message}
                    scheduledFor={msg.scheduledFor}
                    repeat={msg.repeat}
                    voiceNote={msg.voiceNote}
                    onEdit={() => handleEdit(msg.id)}
                    onDelete={() => handleDelete(msg.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <p className="text-muted-foreground">No scheduled messages yet. Create one to get started!</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="activities" className="mt-0">
            <h2 className="text-2xl font-semibold mb-6">Self-Care Activities</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 staggered">
              {activities.map((activity, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-border/30 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">{activity.name}</h3>
                    <span className="px-2 py-1 text-xs rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-200">
                      {activity.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Duration: {activity.duration}</p>
                  <Button size="sm" variant="outline" className="w-full">View Details</Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <audio ref={audioRef} />
    </AppLayout>
  );
}