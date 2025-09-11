"use client";

type FoodCardProps = {
  name: string;
};

export default function FoodCard({ name }: FoodCardProps) {
  return (
    <div className="flex flex-row items-center px-4 rounded-xl h-[10vh] mx-1 bg-gray-100 dark:bg-black/50 ">
      <p className="text-xl lg:text-xl font-extrabold">{name}</p>
    </div>
  );
}
