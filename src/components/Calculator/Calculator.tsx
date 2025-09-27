"use client";

import { useState } from "react";
import SubjectRow from "./SubjectRow";

interface Subject {
  name: string;
  credits: number;
  grade: number;
}

const Calculator: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: "", credits: 0, grade: 0 },
  ]);
  const [cgpa, setCgpa] = useState<number>(0);

  const handleNameChange = (index: number, name: string) => {
    const newSubjects = [...subjects];
    newSubjects[index].name = name;
    setSubjects(newSubjects);
  };

  const handleCreditChange = (index: number, credits: number) => {
    const newSubjects = [...subjects];
    newSubjects[index].credits = credits;
    setSubjects(newSubjects);
    calculateCgpa(newSubjects);
  };

  const handleGradeChange = (index: number, grade: number) => {
    const newSubjects = [...subjects];
    newSubjects[index].grade = grade;
    setSubjects(newSubjects);
    calculateCgpa(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", credits: 0, grade: 0 }]);
  };

  const removeSubject = (index: number) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
    calculateCgpa(newSubjects);
  };

  const calculateCgpa = (subjects: Subject[]) => {
    const totalCredits = subjects.reduce((sum, subj) => sum + subj.credits, 0);
    const weightedGrades = subjects.reduce(
      (sum, subj) => sum + subj.credits * subj.grade,
      0
    );
    setCgpa(
      totalCredits ? parseFloat((weightedGrades / totalCredits).toFixed(2)) : 0
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-1">
        <div className="flex flex-row w-full dark:text-[#C1FF72] h-fit justify-center gap-3">
          <span className="text-[20px] font-bold h-full">GPA</span>
          <span className="flex flex-col items-center text-[70px] font-bold h-full">
            {cgpa}
          </span>
        </div>
        {subjects.map((subject, index) => (
          <SubjectRow
            key={index}
            index={index + 1}
            name={subject.name}
            credits={subject.credits}
            grade={subject.grade}
            onNameChange={(name: string) => handleNameChange(index, name)}
            onCreditChange={(credits: number) =>
              handleCreditChange(index, credits)
            }
            onGradeChange={(grade: number) => handleGradeChange(index, grade)}
            onRemove={() => removeSubject(index)}
          />
        ))}
        <div className="px-3">
          <button
            onClick={addSubject}
            className="mt-6 px-3 py-2 font-bold text-md text-black bg-green-400 dark:bg-[#15241b] dark:text-[#C1FF72] rounded transition-all duration-50 active:scale-98"
          >
            Add Subject
          </button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
