import CustomBreadCrumb from "@/components/custom-bread-crumb-provider";
import Headings from "@/components/headings";
import InterviewPin from "@/components/pin";
import { db } from "@/config/firebase.config";
import type { Interview, UserAnswer } from "@/types";
import { LoaderPage } from "@/views/loader-page";
import { useAuth } from "@clerk/clerk-react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { CircleCheck, Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Feedback() {

    const { interviewId } = useParams<{ interviewId: string }>();
    const [interview, setInterview] = useState<Interview | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
    const [activeFeed, setActiveFeed] = useState("");
    const { userId } = useAuth();
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
                    }
                    else {
                        navigate("/generate", { replace: true });
                    }

                } catch (error) {
                    console.log(error);
                    toast("Error", {
                        description: "Something went wrong. Please try again later..",
                    });

                } finally {
                    setIsLoading(false)
                }




            }
            const fetchFeedbacks = async () => {
                setIsLoading(true)
                try {
                    const feedRef = query(collection(db, "userAnswers"), where("userId", "==", userId), where("mockIdRef", "==", interviewId))
                    const querySnap = await getDocs(feedRef)

                    const feedData: UserAnswer[] = querySnap.docs.map((doc) => {
                        return doc.data() as UserAnswer
                    })
                    setFeedbacks(feedData)

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
            fetchFeedbacks();

        }
    }, [interviewId, navigate, userId])
    // calculte ratings 

    const overAllRating = useMemo(() => {
        if (feedbacks.length === 0) return "0.0";
        const totalRatings = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0)
        return (totalRatings / feedbacks.length).toFixed(1);

    }, [feedbacks])


    if (isLoading) {
        return <LoaderPage className="w-full h-[70vh]" />;
    }





    return (
        <div className="flex flex-col w-full gap-8 py-5">
            <div className="flex items-center justify-between w-full gap-2">
                <CustomBreadCrumb breadCrumbPage={"Feedback"}
                    breadCrumpItems={[
                        { label: "Mock Interviews", link: "/generate" },
                        {
                            label: `${interview?.position}`,
                            link: `/generate/interview/${interview?.id}`,
                        },
                    ]} />
            </div>
            <Headings
                title="Congratulations !"
                description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
            />

            <p className="text-base text-muted-foreground">
                Your overall interview ratings :{" "}
                <span className="text-emerald-500 font-semibold text-xl">
                    {overAllRating} / 10
                </span>
            </p>

            {interview && <InterviewPin interview={interview} onMockPage />}
             <Headings title="Interview Feedback" isSubheading />


             {feedbacks && (<Accordion type="single" collapsible className="space-y-6">
                {feedbacks.map((feed) =>(
                    <AccordionItem key={feed.id} value={feed.id} className="border rounded-lg shadow-md">
                        <AccordionTrigger onClick={() => setActiveFeed(feed.id) } className={cn(
                  "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                activeFeed === feed.id
  ? "bg-gradient-to-r from-purple-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900"
  : "hover:bg-gray-50 dark:hover:bg-gray-800"
                )}>
                    <span>{feed.question}</span>

                        </AccordionTrigger>
                        <AccordionContent className="px-5 py-6  rounded-b-lg space-y-5 shadow-inner">
                <div className="text-lg font-semibold ">
                  <Star className="inline mr-2 text-yellow-400 dark:text-yellow-400" />
                  Rating : {feed.rating}
                </div>

                <Card className="border-none space-y-3 p-4  rounded-lg shadow-md">
                  <CardTitle className="flex items-center">
                    <CircleCheck className="mr-2 text-green-600" />
                    Expected Answer
                  </CardTitle>

                  <CardDescription className="font-medium ">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4  rounded-lg shadow-md">
                  <CardTitle className="flex items-center">
                    <CircleCheck className="mr-2 text-blue-600" />
                    Your Answer
                  </CardTitle>

                  <CardDescription className="font-medium ">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4  rounded-lg shadow-md">
                  <CardTitle className="flex items-center">
                    <CircleCheck className="mr-2 text-red-600" />
                    Feedback
                  </CardTitle>

                  <CardDescription className="font-medium">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>

                    </AccordionItem>
                ))}

             </Accordion>)
             }



        </div>
    )
}
