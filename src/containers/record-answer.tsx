
import { TooltipButton } from '@/components/tooltip-button';
import { useAuth } from '@clerk/clerk-react';
import { CircleStop, Loader, Mic, RefreshCw, Save, Video, VideoOff, WebcamIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
    useLegacyResults: false
  });




  const generateAi = async (qst: string, qstAns: string, userAns: string): Promise<AIResponse> => {
    setIsAiGenerating(true)
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a fresh, history-free chat for this one-time request
    const chat = model.startChat();


      const prompt = `
    Question: "${qst}"
    User Answer: "${userAns}"
    Correct Answer: "${qstAns}"
    
    Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
    
    IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. Do not include \`\`\`json or \`\`\` markers.
    
    Required format:
    {"ratings": number, "feedback": "string"}
    
    Example response:
    {ratings: 7, feedback: "Good understanding but could be more detailed"}
  `;
  
  try {
    const aiResult = await chat.sendMessage(prompt);
    const response =  aiResult.response;
    let responseText = response.text().trim();
    
    // Inline cleaning without separate function
    responseText = responseText.replace(/(```json|```|`)/g, "");
    
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
      startSpeechToText()
    }
  }
  const recordNewAnswer = () => {
    setUserAnswer("")
    stopSpeechToText()
    startSpeechToText()


  }
  const saveUserAnswer = async () =>{
    setLoading(true);

    if (!aiResult) {
      return;
    }

    const currentQuestion = question.question;
    try {
      const userAnswerQuery = query(collection(db , "userAnswers" )  , where("userId" , "==" , userId) , where("question" , "==" , currentQuestion)) 
      const querySnap = await getDocs(userAnswerQuery)

// if user already exxists 

if(!querySnap.empty){
  console.log("Query Snap Size", querySnap.size);
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
  return;
}else{
  //save
  const questionAnswerRef = await addDoc(collection(db, "userAnswers" ),{
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
      
    }finally{
      setLoading(false)
       setOpen(false);
    }
    
  }

  useEffect(() => {
    // combine all transcripts into a single answers
    const combinedTranscripts = results
      .filter((result): result is ResultType => typeof result !== "string")
      .map((result) => result.transcript)
      .join(" ");

    setUserAnswer(combinedTranscripts);
  }, [results]);










  return (

    <div className="w-full flex flex-col items-center gap-8 mt-4">
      {/* save steps */}
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
          {userAnswer || "Start recording to see your ansewer here"}
        </p>

        {interimResult && (
          <p className="text-sm  mt-2">
            <strong>Current Speech : </strong>
            {interimResult}
          </p>
        )}
      </div>
    </div>
  )
}
