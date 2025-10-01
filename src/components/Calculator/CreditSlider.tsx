interface CreditSliderProps {
  value: number;
  onChange: (value: number) => void;
}

const CreditSlider: React.FC<CreditSliderProps> = ({ value, onChange }) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  return (
    <>
      <h1 className="text-center dark:text-[#C1FF72]">Credits:</h1>
      <input
        type="range"
        min="0"
        max="5"
        step="1"
        value={value}
        onChange={handleSliderChange}
        className="w-full accent-black dark:accent-[#C1FF72]"
      />
    </>
  );
};

export default CreditSlider;
