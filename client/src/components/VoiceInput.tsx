import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from "@/hooks/use-toast";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening?: boolean;
  responseText?: string;
}

export default function VoiceInput({ onTranscript, isListening, responseText }: VoiceInputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak, stop } = useTextToSpeech();
  const { toast } = useToast();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition({
    commands: [],
    continuous: true,
  });

  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript]);

  useEffect(() => {
    if (responseText && isSpeaking) {
      speak(responseText);
    }
    return () => stop();
  }, [responseText, isSpeaking]);

  useEffect(() => {
    // Check browser support and permissions on component mount
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Browser Support",
        description: "Your browser doesn't support voice input. Please try Chrome or Edge.",
        variant: "destructive"
      });
    } else {
      // Request microphone permission
      navigator.mediaDevices.getUserMedia({ audio: true })
        .catch(() => {
          toast({
            title: "Microphone Access",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive"
          });
        });
    }
  }, []);

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const toggleListening = async () => {
    try {
      if (listening) {
        await SpeechRecognition.stopListening();
      } else {
        await SpeechRecognition.startListening({ continuous: true });
        toast({
          title: "Voice Input Active",
          description: "Listening for your message...",
        });
      }
    } catch (error) {
      console.error("Voice input error:", error);
      toast({
        title: "Voice Input Error",
        description: "Failed to start voice input. Please check microphone permissions.",
        variant: "destructive"
      });
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stop();
    } else if (responseText) {
      speak(responseText);
    }
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleListening}
        className={listening ? "bg-red-100 hover:bg-red-200" : ""}
      >
        {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSpeaking}
        disabled={!responseText}
      >
        {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}