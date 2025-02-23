import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Button } from './ui/button';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  isListening?: boolean;
  responseText?: string;
}

export default function VoiceInput({ onTranscript, isListening, responseText }: VoiceInputProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { speak, stop } = useTextToSpeech();
  
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

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

  if (!browserSupportsSpeechRecognition) {
    return null;
  }

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true });
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
        className={listening ? "bg-red-100" : ""}
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