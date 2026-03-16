import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const FIFA_CLUB_WORLD_CUP_LEAGUE_ID = 16;
export const FIFA_WORLD_CUP_LEAGUE_SEASON_ID=17;

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
