interface GradeSelectProps {
  value: number;
  onChange: (value: number) => void;
}

const GradeSelect: React.FC<GradeSelectProps> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(parseInt(e.target.value, 10))}
    className="w-20 p-2 rounded-md border dark:bg-gray-800 dark:border-[#C1FF72] dark:text-[#C1FF72]"
  >
    <option value="10">O</option>
    <option value="9">A+</option>
    <option value="8">A</option>
    <option value="7">B+</option>
    <option value="6">B</option>
    <option value="5">C</option>
    <option value="0">F/W/I</option>
  </select>
);

export default GradeSelect;
