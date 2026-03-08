import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const getErrMsg = (
  error: unknown | any,
  situation: "message" | "code"
): string => {
  if (situation === "message") {
    return (
      error?.response?.data?.message ?? error?.message ?? "Something went wrong"
    );
  } else {
    return error?.status;
  }
};
