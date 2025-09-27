import React from 'react';

interface PopUpProps {
  openPopUp: boolean;
  closePopUp: () => void;
  children: React.ReactNode;
}

const PopUp: React.FC<PopUpProps> = ({ openPopUp, closePopUp, children }) => {

  const handleClosePopUp = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'ModelContainer') {
      closePopUp();
    }
  };

  if (!openPopUp) return null;

  return (
    <div
      id='ModelContainer'
      onClick={handleClosePopUp}
      className='fixed inset-0 bg-black flex justify-center items-center bg-opacity-30 backdrop-blur-md'>
      <div className='p-2 dark:bg-zinc-900 w-10/12 md:w-1/2 lg:w-1/2 shadow-inner border-e-emerald-600 rounded-2xl py-5'>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopUp;
