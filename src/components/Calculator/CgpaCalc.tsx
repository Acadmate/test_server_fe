"use client";

import { useState } from "react";
import { HiOutlineXMark } from "react-icons/hi2";

interface Semester {
  gpa: number;
}

const CgpaCalculator: React.FC = () => {
  const [semesters, setSemesters] = useState<Semester[]>([{ gpa: 0 }]);
  const [cgpa, setCgpa] = useState<number>(0);

  const handleGpaChange = (index: number, gpa: string) => {
    const updatedSemesters = [...semesters];
    updatedSemesters[index].gpa = parseFloat(gpa) || 0; // Parse the GPA, default to 0 if invalid
    setSemesters(updatedSemesters);
    calculateCgpa(updatedSemesters);
  };

  const addSemester = () => {
    setSemesters([...semesters, { gpa: 0 }]);
  };

  const removeSemester = (index: number) => {
    const updatedSemesters = semesters.filter((_, i) => i !== index);
    setSemesters(updatedSemesters);
    calculateCgpa(updatedSemesters);
  };

  const calculateCgpa = (semesters: Semester[]) => {
    const totalGpa = semesters.reduce((sum, sem) => sum + sem.gpa, 0);
    const avgGpa = semesters.length
      ? parseFloat((totalGpa / semesters.length).toFixed(2))
      : 0;
    setCgpa(avgGpa);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-2">
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex flex-row w-full dark:text-[#C1FF72] h-fit justify-center gap-3">
          <span className="text-[20px] font-bold h-full">CGPA</span>
          <span className="flex flex-col items-center text-[70px] font-bold h-full">
            {cgpa}
          </span>
        </div>

        {semesters.map((semester, index) => (
          <div
            key={index}
            className="flex flex-col gap-y-3 items-center justify-between p-4 rounded bg-green-100 dark:bg-black dark:text-[#C1FF72]"
          >
            <div className="flex flex-row justify-between w-full">
              <span className="text-xl font-bold">Semester {index + 1}</span>
              <button
                onClick={() => removeSemester(index)}
                className="text-red-500 hover:text-red-700"
              >
                <HiOutlineXMark size={25} />
              </button>
            </div>
            <div className="flex flex-row items-center gap-6 w-full">
              <h1 className="dark:text-[#C1FF72] text-2xl font-bold text-center">
                GPA
              </h1>
              <div className="flex flex-row items-center justify-between w-fit">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={semester.gpa <= 10 ? semester.gpa.toString() : "10"}
                  onChange={(e) => handleGpaChange(index, e.target.value)}
                  className="text-center w-fit lg:w-[60px] p-1 rounded font-bold text-xl dark:bg-gray-700 dark:text-[#C1FF72] border dark:border-[#C1FF72] focus:outline-none"
                  placeholder="GPA"
                />
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="10"
              step="1"
              value={semester.gpa}
              onChange={(e) => handleGpaChange(index, e.target.value)}
              className="w-full accent-black dark:accent-[#C1FF72]"
            />
          </div>
        ))}
      </div>
      <button
        onClick={addSemester}
        className="mt-6 px-4 py-2 font-bold text-lg text-black bg-green-400 dark:bg-[#15241b] dark:text-[#C1FF72] rounded transition-all duration-300 active-scale=95"
      >
        Add Sem
      </button>
    </div>
  );
};

export default CgpaCalculator;
