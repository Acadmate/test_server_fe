interface CreditInputProps {
  value: number;
  onChange: (value: number) => void;
}

const CreditInput: React.FC<CreditInputProps> = ({ value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (/^\d*$/.test(newValue)) {
      onChange(newValue === "" ? 0 : Math.min(parseInt(newValue, 10), 5));
    }
  };

  return (
    <input
      type="number"
      step="1"
      min="0"
      max="5"
      value={value <= 5 ? value.toString() : "5"}
      onChange={handleInputChange}
      className="p-2 w-fit rounded-md border dark:border-[#C1FF72] dark:bg-gray-800 dark:text-[#C1FF72] text-center"
    />
  );
};

export default CreditInput;
