"use client";

import { CheckCircle, Lock, Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  id: number;
  title: string;
  description: string;
  status: "locked" | "available" | "completed";
  icon: string;
  onClick: (lessonId: number) => void;
  isLoading?: boolean;
}

export const LessonCard = ({
  id,
  title,
  description,
  status,
  icon,
  onClick,
  isLoading = false,
}: LessonCardProps) => {
  const [isHovering, setIsHovering] = useState(false);

  const statusMap = {
    locked: {
      bgColor: "bg-slate-50 dark:bg-slate-800/50",
      borderColor: "border-slate-200 dark:border-slate-700",
      icon: <Lock className="h-4 w-4 text-slate-500 dark:text-slate-400" />,
      iconBg: "bg-slate-100 dark:bg-slate-700",
      iconText: "text-slate-500 dark:text-slate-400",
    },
    available: {
      bgColor: "bg-white dark:bg-slate-900",
      borderColor: "border-blue-200 dark:border-blue-800",
      icon: <Play className="h-4 w-4 text-blue-500 fill-blue-500" />,
      iconBg: "bg-blue-50 dark:bg-blue-900/50",
      iconText: "text-blue-500 dark:text-blue-400",
    },
    completed: {
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      icon: <CheckCircle className="h-4 w-4 text-green-500 fill-green-500" />,
      iconBg: "bg-green-100 dark:bg-green-900/50",
      iconText: "text-green-500 dark:text-green-400",
    },
  };

  const currentStatus = statusMap[status];

  const handleClick = () => {
    if (status === "locked" || isLoading) return;
    onClick(id);
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex items-center gap-4 rounded-xl border-2 p-4 transition-all shadow-sm",
          "bg-white dark:bg-slate-900",
          "border-blue-200 dark:border-blue-800",
          "relative overflow-hidden"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/50 dark:via-blue-900/30 to-transparent animate-shimmer" />

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/50 relative">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-700 dark:text-slate-200">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse"></div>
            <p className="text-xs text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
              Đang tải...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all shadow-sm",
        currentStatus.bgColor,
        currentStatus.borderColor,
        status === "locked"
          ? "opacity-80 cursor-not-allowed"
          : "hover:shadow-md",
        status === "available" &&
          isHovering &&
          "transform scale-[1.02] border-blue-300 dark:border-blue-700 shadow-blue-100 dark:shadow-blue-900/20",
        status === "completed" &&
          isHovering &&
          "transform scale-[1.02] border-green-300 dark:border-green-700 shadow-green-100 dark:shadow-green-900/20"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
          currentStatus.iconBg
        )}
      >
        <div className="relative">
          <span className="text-2xl">{icon}</span>
          <div className="absolute -bottom-1 -right-1 rounded-full bg-white dark:bg-slate-900 p-[2px] shadow-sm">
            {currentStatus.icon}
          </div>
        </div>
      </div>
      <div>
        <h3
          className={cn(
            "font-bold",
            status === "locked"
              ? "text-slate-500 dark:text-slate-400"
              : "text-slate-700 dark:text-slate-200"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-sm",
            status === "locked"
              ? "text-slate-400 dark:text-slate-500"
              : "text-slate-500 dark:text-slate-400"
          )}
        >
          {description}
        </p>
      </div>
      {status === "available" && isHovering && (
        <div className="ml-auto animate-pulse">
          <p className="text-xs font-medium text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
            Start lesson
          </p>
        </div>
      )}
    </div>
  );
};
