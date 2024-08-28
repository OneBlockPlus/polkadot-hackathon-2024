const ProfileStat = ({ value, label, currency }: { value: number; label: string; currency?: string }) => (
  <div className="flex flex-col flex-1 gap-1 items-center bg-goku border border-beerus rounded-moon-i-xs p-4">
    <h4 className="text-hit text-moon-24 font-semibold">
      {value ? value : 0} {currency}
    </h4>
    <p className="text-center">{label}</p>
  </div>
);

export default ProfileStat;
