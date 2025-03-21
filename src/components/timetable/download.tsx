interface DownloadProps {
  func: () => void;
}

export default function Download({ func }: DownloadProps) {
  return (
    <div
      onClick={func}
      className="flex flex-row px-3 py-1 text-sm items-center justify-center bg-gray-100 dark:bg-[#15241b] dark:text-[#C1FF72] rounded font-bold active:scale-95 transition-all duration-200 w-fit cursor-pointer"
    >
      Download PDF
    </div>
  );
}
