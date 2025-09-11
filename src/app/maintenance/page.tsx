import { LuServerOff } from "react-icons/lu";

export default function Maintenance() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-black dark:text-white">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-gray-900 dark:text-gray-100">
        Acadmate.in
      </h1>
      <p className="text-center text-lg md:text-2xl text-gray-700 dark:text-gray-300 max-w-2xl">
        Yo, we’re just optimising the backend stuff. Hang tight we will be back
        up and runnin soon!
      </p>
      <div className="text-[100px] py-4 text-red-300">
        <LuServerOff />
      </div>
    </div>
  );
}
