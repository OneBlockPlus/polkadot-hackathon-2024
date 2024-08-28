export const InfoBox = ({ icon, label, className }: { icon: JSX.Element; label: string; className?: string }) => {
  return (
    <div className={`bg-pan text-gohan w-full rounded-moon-i-sm flex border border-beerus gap-2 items-center p-2 ${className && className}`}>
      <div className="text-moon-24 h-6 w-6">{icon}</div>
      <p className="text-moon-14">{label}</p>
    </div>
  );
};

export default InfoBox;
