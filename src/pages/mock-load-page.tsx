import CustomBreadCrumb from "@/components/custom-bread-crumb-provider";
import InterviewPin from "@/components/pin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { db } from "@/config/firebase.config";
import type { Interview } from "@/types";
import { LoaderPage } from "@/views/loader-page";
import { doc, getDoc } from "firebase/firestore";
import { Lightbulb, Sparkles, WebcamIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Webcam from "react-webcam";

export default function MockLockPage() {
  const { interviewId } = useParams<{ interviewId: string }>();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWebCamEnabled, setIsWebCamEnabled] = useState(false);
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }

  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        setIsLoading(true);
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            setInterview({ ...interviewDoc.data() } as Interview);
          } else {
            navigate("/generate", { replace: true });
          }
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchInterview();
    }
  }, [interviewId, navigate]);

  if (isLoading) {
    return <LoaderPage className="w-full h-[50vh]" />;
  }

  return (
    <div className="flex flex-col w-full gap-6 py-4">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={interview?.position || ""}
          breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
        />
        <Link to={`/generate/interview/${interviewId}/start`}>
          <Button size={"sm"}>
            Start <Sparkles />
          </Button>
        </Link>
      </div>

      {interview && <InterviewPin interview={interview} onMockPage />}

      <Alert className="bg-yellow-100/50 border-yellow-200 dark:bg-white dark:border-white p-3 rounded-lg flex items-start gap-3 -mt-3">
        <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-black flex-shrink-0 mt-0.5" />
        <div>
          <AlertTitle className="text-yellow-800 dark:text-black font-semibold text-sm">
            Important Information
          </AlertTitle>
          <AlertDescription className="text-xs text-yellow-700 dark:text-black mt-1 leading-relaxed">
            Enable webcam and microphone for the AI mock interview. Five questions with personalized feedback at the end.
            
            <span className="font-medium block mt-1">Note: Video never recorded. Disable webcam anytime.</span>
          </AlertDescription>
        </div>
      </Alert>

      <div className="flex items-center justify-center w-full">
        <div className="w-72 md:w-88 h-56 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-lg">
          {isWebCamEnabled ? (
            <Webcam
              onUserMedia={() => setIsWebCamEnabled(true)}
              onUserMediaError={() => setIsWebCamEnabled(false)}
              className="w-full h-48 object-cover rounded-md"
            />
          ) : (
            <WebcamIcon className="w-20 h-20 text-muted-foreground" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Button onClick={() => setIsWebCamEnabled(!isWebCamEnabled)}>
          {isWebCamEnabled ? "Disable Webcam" : "Enable Webcam"}
        </Button>
      </div>
    </div>
  );
}