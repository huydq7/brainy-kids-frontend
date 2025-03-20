"use client";
import { useEffect, useState } from "react";
import { Course } from "@/types/courses";
import { List } from "./list";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();
  console.log("userId", userId);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        toast.error(`Failed to load courses: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (isLoading)
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );

  return (
    <div className="mx-auto h-full max-w-[1200px] px-3 py-6">
      <div className="relative mb-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern-bg.svg')] bg-repeat opacity-20"></div>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome to Learning Adventure!
            </h1>
            <p className="mt-2 text-blue-100">
              Choose a course and start your learning journey today!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">🌎</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Language Courses
            </h2>
          </div>
          <Separator className="my-4 bg-gradient-to-r from-blue-500 to-purple-500" />
          <List courses={courses} activeCourseId={1} />
        </section>
      </div>
    </div>
  );
};

export default CoursesPage;
