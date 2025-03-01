"use client";
import sanassi from "@/components/messmenu/sanassi.json";
import greenpearl from "@/components/messmenu/NRIGreenPearl.json";
import mblock from "@/components/messmenu/Mblock.json";
import FoodCard from "@/components/messmenu/FoodCard";
import { useEffect, useState } from "react";
import { GrFormNextLink, GrFormPreviousLink } from "react-icons/gr";
import Title from "@/components/shared/title";
import { useRouter } from "next/navigation";

type MealType = "BREAKFAST" | "LUNCH" | "SNACKS" | "DINNER";
type DayMeals = { [key in MealType]: string[] };
type DailyMenu = { name: string; meals: DayMeals };
type WeeklyMenu = { messName: string; weekMenu: DailyMenu[] };

const mealOrder: MealType[] = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

export default function Messmenu() {
  const router = useRouter();
  const [mess, setMess] = useState<WeeklyMenu | null>(null);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(
    new Date().getDay()
  );
  const [currentMealIndex, setCurrentMealIndex] = useState<number>(0);

  useEffect(() => {
    const redirectToLogin = () => {
      localStorage.clear();
      router.replace("/login");
    };

    if (!localStorage.getItem("stats")) {
      redirectToLogin();
      return;
    }
  }, []);

  useEffect(() => {
    const getDefaultMess = (): WeeklyMenu => {
      const savedMess = localStorage.getItem("defaultMess");
      if (savedMess === "GreenPearl") return greenpearl;
      if (savedMess === "Mblock") return mblock;
      return sanassi;
    };

    setMess(getDefaultMess());
  }, []);

  useEffect(() => {
    if (mess?.messName) {
      localStorage.setItem("defaultMess", mess.messName);
    }
  }, [mess]);

  useEffect(() => {
    const determineMealIndex = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 10) return 0;
      if (currentHour < 15) return 1;
      if (currentHour < 18) return 2;
      return 3;
    };
    setCurrentMealIndex(determineMealIndex());
  }, []);

  if (!mess) {
    return null;
  }

  const menu = mess.weekMenu;
  const todayMenu = menu[currentDayIndex];
  const mealType = mealOrder[currentMealIndex];

  const getButtonClass = (messName: string) => {
    const isSelected = mess.messName === messName;
    return `relative z-10 px-6 py-2.5 text-sm font-medium transition-all duration-300 ${
      isSelected
        ? "text-black dark:text-[#C1FF72] font-bold"
        : "text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200"
    }`;
  };

  const handleNextMeal = () => {
    setCurrentMealIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;
      if (nextIndex >= mealOrder.length) {
        setCurrentDayIndex((currentDayIndex + 1) % menu.length);
        return 0;
      }
      return nextIndex;
    });
  };

  const handlePrevMeal = () => {
    setCurrentMealIndex((prevIndex) => {
      const nextIndex = prevIndex - 1;
      if (nextIndex < 0) {
        setCurrentMealIndex(mealOrder.length - 1);
        setCurrentDayIndex((currentDayIndex - 1 + menu.length) % menu.length);
      } else {
        return nextIndex;
      }
      return prevIndex;
    });
  };

  const getBlobPosition = () => {
    switch (mess.messName) {
      case "GreenPearl":
        return "translate-x-[97%]";
      case "Mblock":
        return "translate-x-[193%]";
      default:
        return "translate-x-0";
    }
  };

  return (
    <div className="mx-auto h-fit w-screen lg:w-[70vw] my-4 px-4">
      <div className="flex flex-col gap-4 w-full">
        <Title />

        <div className="relative flex flex-row items-center justify-between rounded-full w-fit mx-auto bg-gray-100 dark:bg-gray-800/30 p-1">
          <div
            className={`absolute top-1 left-1 h-[calc(100%-8px)] w-1/3 bg-green-300/40 dark:bg-[#15241b] rounded-full transition-all duration-300 transform ${getBlobPosition()}`}
          ></div>

          <button
            type="button"
            className={`flex flex-row items-center justify-center w-full text-nowrap ${getButtonClass(
              "Sanassi"
            )}`}
            onClick={() => setMess(sanassi)}
          >
            Sanassi
          </button>
          <button
            type="button"
            className={`flex flex-row items-center justify-center w-full text-nowrap ${getButtonClass(
              "GreenPearl"
            )}`}
            onClick={() => setMess(greenpearl)}
          >
            Green Pearl
          </button>
          <button
            type="button"
            className={`flex flex-row items-center justify-center w-full text-nowrap ${getButtonClass(
              "Mblock"
            )}`}
            onClick={() => setMess(mblock)}
          >
            M-block
          </button>
        </div>

        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-lg px-6 py-3 rounded-full text-center font-semibold bg-green-300/40 dark:bg-[#15241b] dark:text-[#C1FF72] shadow-sm">
            {todayMenu.name} | {mealType}
          </h2>
        </div>

        {todayMenu ? (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {todayMenu.meals[mealType].map((item, index) => (
                <FoodCard key={index} name={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No menu available for today.
            </p>
          </div>
        )}

        <div className="flex flex-row justify-center w-full">
          <div className="fixed bottom-6 w-fit flex items-center gap-8 md:gap-24 rounded-full bg-black/50 dark:bg-black/30 backdrop-blur-lg px-4 py-2 shadow-lg">
            <button
              onClick={handlePrevMeal}
              className="p-3 text-white bg-[#15241b] text-[#C1FF72] rounded-full transition-colors shadow-sm active:scale-95 duration-200 transition-all"
            >
              <GrFormPreviousLink className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMeal}
              className="p-3 text-white bg-[#15241b] text-[#C1FF72] rounded-full transition-colors shadow-sm active:scale-95 duration-200 transition-all"
            >
              <GrFormNextLink className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
