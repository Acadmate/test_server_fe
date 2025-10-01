import React from "react";
import CreditSlider from "./CreditSlider";
import CreditInput from "./CreditInput";
import GradeSelect from "./GradeSelect";
import { HiOutlineXMark } from "react-icons/hi2";

interface SubjectRowProps {
  index: number;
  name: string;
  credits: number;
  grade: number;
  onNameChange: (name: string) => void;
  onCreditChange: (credits: number) => void;
  onGradeChange: (grade: number) => void;
  onRemove: () => void;
}

const SubjectRow: React.FC<SubjectRowProps> = ({
  index,
  name,
  credits,
  grade,
  onNameChange,
  onCreditChange,
  onGradeChange,
  onRemove,
}) => {
  return (
    <div className="relative flex flex-col gap-y-2 bg-green-100 dark:bg-black p-3 rounded-lg w-full my-1">
      {/* Close Button */}
      <div className="flex flex-row justify-end w-full">
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 rounded"
        >
          <HiOutlineXMark size={25} />
        </button>
      </div>

      {/* Slider */}
      <CreditSlider value={credits} onChange={onCreditChange} />

      {/* Subject Name, Credit Input, and Grade Select */}
      <div className="flex items-center flex-row gap-x-[3vw] md:gap-x-[2vw]">
        <input
          type="text"
          placeholder={`Subject ${index}`}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="flex-1 p-2 rounded-md border dark:border-[#C1FF72] dark:bg-gray-800 dark:text-[#C1FF72] outline-none"
        />

        {/* Bound Credit Input */}
        <CreditInput value={credits} onChange={onCreditChange} />

        {/* Grade Selection */}
        <GradeSelect value={grade} onChange={onGradeChange} />
      </div>
    </div>
  );
};

export default SubjectRow;
