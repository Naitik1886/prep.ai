import { TooltipButton } from '@/components/tooltip-button';
import { useAuth } from '@clerk/clerk-react';
import { CircleStop, Loader, Mic, RefreshCw, Save, Video, VideoOff, WebcamIcon } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import useSpeechToText, { type ResultType } from 'react-hook-speech-to-text';
import { useParams } from 'react-router-dom';
import Webcam from "react-webcam";
import { toast } from 'sonner';
import {
  GoogleGenerativeAI
} from "@google/generative-ai";
import SaveModal from '@/components/save-modal';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

interface RecordAnswerProps {
  question: { question: string; answer: string }
  isWebcam: boolean
  setIsWebcam: (value: boolean) => void
}
interface AIResponse {
  ratings: number;
  feedback: string;
}

export default function RecordAnswer({ question, isWebcam, setIsWebcam }: RecordAnswerProps) {
  const [userAnswer, setUserAnswer] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Add refs to track processed results and prevent duplicates
  const processedResultsRef = useRef(new Set<string>());
  const lastTranscriptRef = useRef<string>("");

  const { userId } = useAuth();
  const { interviewId } = useParams();

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    // Add these options for better mobile compatibility
    interimResults: true,
    timeout: 10000, // 10 seconds timeout
    speechRecognitionProperties: {
      lang: 'en-US',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1
    }
  });

  const generateAi = async (qst: string, qstAns: string, userAns: string): Promise<AIResponse> => {
    setIsAiGenerating(true)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat();

    const prompt = `
    Question: "${qst}"
    User Answer: "${userAns}"
    Correct Answer: "${qstAns}"

    Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.

    IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not include \\\json or \\\ markers.

    Required format:
    {"ratings": number, "feedback": "string"}

    Example response:
    {ratings: 7, feedback: "Good understanding but could be more detailed"}
  `;

    try {
      const aiResult = await chat.sendMessage(prompt);
      const response = aiResult.response;
      let responseText = response.text().trim();

      responseText = responseText.replace(/(json||`)/g, "");

      const parsedResponse = JSON.parse(responseText);

      return {
        ratings: parsedResponse.ratings,
        feedback: parsedResponse.feedback
      };

    } catch (error) {
      console.log(error)
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return { ratings: 0, feedback: "Unable to generate feedback" }
    } finally {
      setIsAiGenerating(false)
    }
  }

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText()
      if (userAnswer?.length < 20) {
        toast.error("Error", {
          description: "Your answer should be more than 20 characters",
        });
        return;
      }
      const aiResult = await generateAi(
        question.question,
        question.answer,
        userAnswer
      );
      setAiResult(aiResult);
    } else {
      // Clear previous results when starting new recording
      processedResultsRef.current.clear();
      lastTranscriptRef.current = "";
      setUserAnswer("");
      startSpeechToText()
    }
  }

  const recordNewAnswer = () => {
    setUserAnswer("")
    processedResultsRef.current.clear();
    lastTranscriptRef.current = "";
    stopSpeechToText()
    // Small delay to ensure proper cleanup
    setTimeout(() => {
      startSpeechToText()
    }, 100);
  }

  const saveUserAnswer = async () => {
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      )
      const querySnap = await getDocs(userAnswerQuery)

      if (!querySnap.empty) {
        console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      } else {
        const questionAnswerRef = await addDoc(collection(db, "userAnswers"), {
          mockIdRef: interviewId,
          question: question.question,
          correct_ans: question.answer,
          user_ans: userAnswer,
          feedback: aiResult.feedback,
          rating: aiResult.ratings,
          userId,
          createdAt: serverTimestamp(),
        })
        const id = questionAnswerRef.id;

        await updateDoc(doc(db, "userAnswers", id), {
          id,
          updatedAt: serverTimestamp(),
        });

        toast("Saved", { description: "Your answer has been saved.." });
      }
      setUserAnswer("")
      stopSpeechToText()

    } catch (error) {
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      console.log(error);
    } finally {
      setLoading(false)
      setOpen(false);
    }
  }

  // Improved useEffect to handle duplicate transcripts on mobile
  useEffect(() => {
    if (!results || results.length === 0) return;

    // Filter and process results to avoid duplicates
    const validResults = results.filter((result): result is ResultType => 
      typeof result !== "string" && result.transcript
    );

    if (validResults.length === 0) return;

    // Get the latest result
    const latestResult = validResults[validResults.length - 1];
    const currentTranscript = latestResult.transcript.trim();

    // Skip if it's the same as the last processed transcript
    if (currentTranscript === lastTranscriptRef.current) return;

    // For mobile compatibility, use only the latest final result
    // and avoid processing interim results that might cause duplicates
    if (latestResult.isFinal || validResults.length === 1) {
      // Create a unique identifier for this transcript
      const transcriptId = `${currentTranscript}_${Date.now()}`;
      
      // Check if we've already processed this transcript
      if (!processedResultsRef.current.has(currentTranscript)) {
        processedResultsRef.current.add(currentTranscript);
        lastTranscriptRef.current = currentTranscript;
        
        // Set the user answer to the latest transcript
        setUserAnswer(currentTranscript);
      }
    }
  }, [results]);

  // Alternative approach: Use a debounced effect for mobile
  useEffect(() => {
    if (!isRecording) return;

    const timer = setTimeout(() => {
      // This helps ensure we only process stable results
      const validResults = results.filter((result): result is ResultType => 
        typeof result !== "string" && result.transcript
      );

      if (validResults.length > 0) {
        const latestTranscript = validResults[validResults.length - 1].transcript.trim();
        
        // Only update if it's significantly different from the last one
        if (latestTranscript !== lastTranscriptRef.current && latestTranscript.length > 0) {
          // Check for word repetition pattern (common mobile issue)
          const words = latestTranscript.split(' ');
          const uniqueWords = [...new Set(words)];
          
          // If we detect heavy repetition, try to clean it
          if (words.length > uniqueWords.length * 3) {
            // Likely repetition issue, use cleaned version
            const cleanedTranscript = uniqueWords.join(' ');
            setUserAnswer(cleanedTranscript);
            lastTranscriptRef.current = cleanedTranscript;
          } else {
            setUserAnswer(latestTranscript);
            lastTranscriptRef.current = latestTranscript;
          }
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [results, isRecording]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />
      <div className="w-72 md:w-96 h-62 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
        {isWebcam ? (
          <Webcam
            onUserMedia={() => setIsWebcam(true)}
            onUserMediaError={() => setIsWebcam(false)}
            className="w-full h-52 object-cover rounded-md"
          />
        ) : (
          <WebcamIcon className="min-w-24 min-h-24 text-muted-foreground" />
        )}
      </div>
      <div className="flex items-center justify-center gap-3">
        <TooltipButton
          content={isWebcam ? "Turn Off" : "Turn On"}
          icon={
            isWebcam ? (
              <VideoOff className="min-w-5 min-h-5" />
            ) : (
              <Video className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setIsWebcam(!isWebcam)}
        />

        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={
            isRecording ? (
              <CircleStop className="min-w-5 min-h-5" />
            ) : (
              <Mic className="min-w-5 min-h-5" />
            )
          }
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw className="min-w-5 min-h-5" />}
          onClick={recordNewAnswer}
        />

        <TooltipButton
          content="Save Result"
          icon={
            isAiGenerating ? (
              <Loader className="min-w-5 min-h-5 animate-spin" />
            ) : (
              <Save className="min-w-5 min-h-5" />
            )
          }
          onClick={() => setOpen(!open)}
          disabled={!aiResult}
        />
      </div>
      <div className="w-full mt-4 p-4 border rounded-md ">
        <h2 className="text-lg font-semibold">Your Answer:</h2>
        <p className="text-sm mt-2 whitespace-normal">
          {userAnswer || "Start recording to see your answer here"}
        </p>

        {interimResult && (
          <p className="text-sm mt-2">
            <strong>Current Speech: </strong>
            {interimResult}
          </p>
        )}
      </div>
    </div>
  )
}