import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

const MeetingAssistant = () => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  // Initialize audio context
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      // Setup audio context for visualization
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Setup media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processRecording(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setMeetingDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Start audio level monitoring
      monitorAudioLevel();

    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Pause/Resume recording
  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  // Monitor audio levels
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!isRecording) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setAudioLevel(Math.min(100, (average / 128) * 100));
      
      requestAnimationFrame(updateLevel);
    };
    
    updateLevel();
  };

  // Process recording (simulate transcription and analysis)
  const processRecording = async (audioBlob) => {
    setIsTranscribing(true);
    
    // Simulate transcription process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockTranscript = `Meeting Transcript - ${new Date().toLocaleString()}

John: Good morning everyone. Thanks for joining today's meeting. Let's start with the project updates.

Sarah: I've completed the frontend implementation for the new dashboard. The UI is responsive and all the components are working as expected.

Mike: Great work Sarah. I've finished the API integration and we're now ready for testing. The endpoints are all documented and tested.

Emily: From the design side, I've updated the color scheme and typography based on the user feedback we received last week.

John: Excellent progress everyone. Let's discuss the next steps and timeline for the beta release.

Sarah: I estimate we need about 3 more days for final testing and bug fixes.

Mike: I agree. The backend is stable and we can handle the expected load.

Emily: I'll have the final design assets ready by tomorrow.

John: Perfect. So our target for beta release is next Tuesday. Let's make sure everything is tested thoroughly.

Action items:
- Sarah: Complete final testing by Monday
- Mike: Prepare deployment documentation
- Emily: Finalize design assets by tomorrow
- John: Schedule beta release announcement

Next meeting: Friday for final review before release.`;

    setTranscript(mockTranscript);
    
    // Generate summary
    const mockSummary = `Meeting Summary:
- Duration: ${formatDuration(meetingDuration)}
- Participants: John, Sarah, Mike, Emily
- Status: Project on track for beta release
- Key decisions: Beta release scheduled for next Tuesday
- Timeline: 3 days for final testing and bug fixes
- Next steps: Complete testing, prepare documentation, finalize design assets`;

    setSummary(mockSummary);
    
    // Extract action items
    const mockActionItems = [
      { id: 1, assignee: 'Sarah', task: 'Complete final testing by Monday', priority: 'high', dueDate: getNextMonday() },
      { id: 2, assignee: 'Mike', task: 'Prepare deployment documentation', priority: 'medium', dueDate: getNextTuesday() },
      { id: 3, assignee: 'Emily', task: 'Finalize design assets by tomorrow', priority: 'high', dueDate: getTomorrow() },
      { id: 4, assignee: 'John', task: 'Schedule beta release announcement', priority: 'medium', dueDate: getNextTuesday() }
    ];
    
    setActionItems(mockActionItems);
    
    // Set participants
    setParticipants([
      { name: 'John', role: 'Project Manager', speakingTime: '35%' },
      { name: 'Sarah', role: 'Frontend Developer', speakingTime: '25%' },
      { name: 'Mike', role: 'Backend Developer', speakingTime: '25%' },
      { name: 'Emily', role: 'UI Designer', speakingTime: '15%' }
    ]);
    
    setIsTranscribing(false);
  };

  // Helper functions
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getNextMonday = () => {
    const date = new Date();
    const daysUntilMonday = (1 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilMonday);
    return date.toLocaleDateString();
  };

  const getNextTuesday = () => {
    const date = new Date();
    const daysUntilTuesday = (2 - date.getDay() + 7) % 7 || 7;
    date.setDate(date.getDate() + daysUntilTuesday);
    return date.toLocaleDateString();
  };

  const getTomorrow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString();
  };

  // Export meeting data
  const exportMeetingData = () => {
    const meetingData = {
      title: meetingTitle || 'Meeting',
      date: new Date().toISOString(),
      duration: meetingDuration,
      transcript,
      summary,
      actionItems,
      participants
    };

    const blob = new Blob([JSON.stringify(meetingData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-full flex flex-col ${theme.app.bg}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${theme.app.toolbar}`}>
        <h2 className="text-lg font-semibold">Meeting Assistant</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            placeholder="Meeting title..."
            className={`px-3 py-1 rounded ${theme.app.input}`}
          />
          <button
            onClick={exportMeetingData}
            disabled={!transcript}
            className={`px-3 py-1 rounded ${theme.app.button} disabled:opacity-50`}
          >
            Export
          </button>
        </div>
      </div>

      {/* Recording Controls */}
      <div className={`p-4 border-b ${theme.app.border}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Recording button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>
            
            {/* Pause button */}
            {isRecording && (
              <button
                onClick={togglePause}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${theme.app.button}`}
              >
                {isPaused ? '▶️' : '⏸️'}
              </button>
            )}
            
            {/* Timer */}
            <div className="text-center">
              <div className="text-2xl font-mono font-bold">
                {formatDuration(meetingDuration)}
              </div>
              <div className={`text-sm ${theme.text.secondary}`}>
                {isRecording ? (isPaused ? 'Paused' : 'Recording') : 'Not recording'}
              </div>
            </div>
          </div>
          
          {/* Audio level indicator */}
          {isRecording && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Audio Level:</span>
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main content */}
        <div className="flex-1 p-4 space-y-4">
          {/* Transcript */}
          <div className={`p-4 rounded-lg border ${theme.app.border} h-64 overflow-y-auto`}>
            <h3 className="font-semibold mb-3">Transcript</h3>
            {isTranscribing ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Transcribing meeting...</p>
                </div>
              </div>
            ) : transcript ? (
              <pre className="whitespace-pre-wrap text-sm font-mono">{transcript}</pre>
            ) : (
              <div className="text-center text-gray-500 h-32 flex items-center justify-center">
                <p>Start recording to generate transcript</p>
              </div>
            )}
          </div>

          {/* Summary */}
          {summary && (
            <div className={`p-4 rounded-lg border ${theme.app.border}`}>
              <h3 className="font-semibold mb-3">AI Summary</h3>
              <pre className="whitespace-pre-wrap text-sm">{summary}</pre>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 p-4 space-y-4">
          {/* Action Items */}
          <div>
            <h3 className="font-semibold mb-3">Action Items</h3>
            {actionItems.length > 0 ? (
              <div className="space-y-2">
                {actionItems.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${theme.app.border}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-medium text-sm">{item.task}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.priority === 'high' ? 'bg-red-100 text-red-800' :
                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Assignee: {item.assignee} • Due: {item.dueDate}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4">
                <p>No action items yet</p>
              </div>
            )}
          </div>

          {/* Participants */}
          {participants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Participants</h3>
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{participant.name[0]}</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{participant.name}</div>
                        <div className="text-xs text-gray-500">{participant.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {participant.speakingTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingAssistant;
