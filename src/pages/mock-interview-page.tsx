import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { Lightbulb } from "lucide-react";

import { db } from "@/config/firebase.config";
import { LoaderPage } from "@/views/loader-page";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Interview } from "@/types";
import CustomBreadCrumb from "@/components/custom-bread-crumb-provider";
import QuestionSection from "@/containers/question-section";

export const MockInterviewPage = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="flex flex-col w-full gap-4 py-3">
      <CustomBreadCrumb
        breadCrumbPage="Start"
        breadCrumpItems={[
          { label: "Mock Interviews", link: "/generate" },
          {
            label: interview?.position || "",
            link: `/generate/interview/${interview?.id}`,
          },
        ]}
      />

      <div className="w-full">
        <Alert className="bg-sky-100 border border-sky-200 p-3 rounded-md flex items-start gap-2">
          <Lightbulb className="h-4 w-4 dark:text-sky-800 mt-0.5" />
          <div>
            <AlertTitle className="text-sky-800 font-semibold text-sm">
              Important Note
            </AlertTitle>
            <AlertDescription className="text-xs text-sky-700 mt-0.5 leading-relaxed">
              Press "Record Answer" to begin answering. Once finished, save and move to the next question. After all questions, you'll receive feedback on the dashboard.
              
              <span className="font-medium block mt-1">Note: Video is never recorded. You can disable the webcam anytime.</span>
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {interview?.questions && interview?.questions.length > 0 && (
        <div className="mt-2 w-full flex flex-col items-start gap-3">
          <QuestionSection questions={interview?.questions} />
        </div>
      )}
    </div>
  );
};