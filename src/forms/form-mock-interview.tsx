import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from "react-hook-form"

import type { Interview } from "@/types";
import CustomBreadCrumb from '@/components/custom-bread-crumb-provider';
import { useEffect, useState } from 'react';
import Headings from '@/components/headings';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Trash2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    GoogleGenerativeAI
} from "@google/generative-ai";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

interface FormMockInterviewProps {
    initialData: Interview | null
}

const formSchema = z.object({
    position: z
        .string()
        .min(1, "Position is required")
        .max(100, "Position must be 100 characters or less"),
    description: z.string().min(10, "Description is required"),
    experience: z.coerce
        .number()
        .min(0, "Experience cannot be empty or negative"),
    techStack: z.string().optional().default("no techStacks found"),
})

type FormData = z.infer<typeof formSchema>


export default function FormMockInterview({ initialData }: FormMockInterviewProps) {

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {},
    });


    const title = initialData ? initialData.position : "Create a new mock Interview"

    const breadCrumbPage = initialData ? initialData.position : "Create"
    const actions = initialData ? "Save Changes" : "Create";
    const toastMessage = initialData
        ? { title: "Updated..!", description: "Changes saved successfully..." }
        : { title: "Created..!", description: "New Mock Interview created..." };


    const { isValid, isSubmitting } = form.formState
    const [isLoading, setIsLoading] = useState(false)
    const { userId } = useAuth()
    const navigate = useNavigate()



    const generateAi = async (data: FormData) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY!;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create a fresh, history-free chat for this one-time request
        const chat = model.startChat();

        const prompt = `Based on the following job details, generate 5 relevant interview questions and their corresponding ideal answers.

**Job Details:**
- Job Position: ${data?.position}
- Job Description: ${data?.description}
- Years of Experience Required: ${data?.experience}
- Tech Stacks: ${data?.techStack}

**Formatting and Logic Instructions:**
1. For technical positions (like 'sde', 'web developer', 'ai engineer', 'ml engineer'), create questions that deeply assess the specified 'Tech Stacks' in the context of the required 'Years of Experience'.
2. For non-technical positions (like 'legal associate', 'judiciary'), you MUST completely ignore the 'Tech Stacks' field and base your questions solely on the 'Job Position', 'Job Description', and 'Years of Experience'.
3. The output format must be a raw JSON array of objects. Each object must have exactly two keys: "question" and "answer". Do not add any text, labels, explanations, or markdown formatting like \`\`\`json before or after the array. Your entire response should be only the JSON array.`

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const aiResponseText = response.text();

        console.log("AI Response:", aiResponseText);
        // ... (your logic to parse and save the response) ...

        toast.success("Questions generated successfully!");
        return JSON.parse(aiResponseText); // Return the parsed result



    }

    const onSubmit = async (data: FormData) => {
        console.log(data)
        if (data) {
            try {
                setIsLoading(true);
                // update api : if change in some fields 
                if (initialData) {
                    if (isValid) {
                        const aiResult = await generateAi(data)
                        await updateDoc(doc(db, "interviews", initialData?.id), {
                            ...data,
                            questions: aiResult,
                            updatedAt: serverTimestamp()
                        })
                        toast(toastMessage.title, { description: toastMessage.description });
                    }
                }
                // create new interview 
                else {
                    if (isValid) {
                        const aiResult = await generateAi(data)
                        const interviewRef = await addDoc(collection(db, "interviews"), {
                            ...data,
                            userId,
                            questions: aiResult,
                            createdAt: serverTimestamp()

                        })
                        const id = interviewRef.id
                        await updateDoc(doc(db, "interviews", id), {
                            id,
                            updatedAt: serverTimestamp()
                        })
                        toast(toastMessage.title, { description: toastMessage.description });
                        toast.success("form submitted succesfully")
                    }
                }
                navigate("/generate", { replace: true });

            } catch (error) {
                console.log(error)
                toast.error("Error..", {
                    description: `Something went wrong. Please try again later`,
                });

            } finally {
                setIsLoading(false);
            }
        }
    }

    useEffect(() => {
        if (initialData) {
            form.reset({
                position: initialData.position,
                description: initialData.description,
                experience: initialData.experience,
                techStack: initialData.techStack,
            });
        }
    }, [initialData, form]);

    return (
        <div className="w-full flex-col space-y-4">
            <CustomBreadCrumb
                breadCrumbPage={breadCrumbPage}
                breadCrumpItems={[{
                    label: "Mock Interviews", link: "/generate"
                }]} />

            <div className="mt-4 flex items-center justify-between w-full">
                <Headings title={title} isSubheading />

               
            </div>
            <Separator className="my-6" />
            <div className='my-6'></div>

            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full p-8 rounded-lg flex-col flex items-start justify-start gap-6 shadow-md "

                >
                    <FormField
                        control={form.control}
                        name='position'
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>
                                        Job Role / Job Position
                                    </FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Input className="h-12"
                                        disabled={isLoading}
                                        placeholder="eg:- Full Stack Developer * "
                                        {...field} />
                                </FormControl>

                            </FormItem>
                        )}


                    />

                    <FormField
                        control={form.control}
                        name='description'
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>
                                        Job Description
                                    </FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Textarea className='h-12' disabled={isLoading} placeholder="eg:- describle your job role *" {...field} />
                                </FormControl>
                            </FormItem>
                        )}



                    />


                    <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Years of Experience</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Input
                                        type="number"
                                        className="h-12"
                                        disabled={isLoading}
                                        placeholder="eg:- 5 *"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="techStack"
                        render={({ field }) => (
                            <FormItem className="w-full space-y-4">
                                <div className="w-full flex items-center justify-between">
                                    <FormLabel>Tech Stacks</FormLabel>
                                    <FormMessage className="text-sm" />
                                </div>
                                <FormControl>
                                    <Textarea
                                        className="h-12"
                                        disabled={isLoading}
                                        placeholder="eg:- React  (optional field for non-technical positions)"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />


                    <div className="w-full flex items-center justify-end gap-6">
                        <Button
                            type="reset"
                            size={"sm"}
                            variant={"outline"}
                            disabled={isSubmitting || isLoading}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            size={"sm"}
                            disabled={isSubmitting || !isValid || isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="text-gray-50 animate-spin" />
                            ) : (
                                actions
                            )}
                        </Button>
                    </div>



                </form>

            </FormProvider>

        </div>
    )

}
