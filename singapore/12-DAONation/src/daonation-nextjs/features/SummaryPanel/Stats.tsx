import ProfileStat from '../../components/components/ProfileStat';

export interface ProfileStats {
  daosCreated: number;
  goalsCreated: number;
  ideasCreated: number;
  commentsCreated: number;
  commentsReceived: number;
  donationsReceived: number;
  donated: number;
}

const Stats = ({ stats, currency }: { stats: ProfileStats; currency: string }) => (
  <div className="flex flex-col gap-2 w-full">
    <div className="flex w-full gap-2">
      <ProfileStat value={stats.daosCreated} label="DAOs created" />
      <ProfileStat value={stats.goalsCreated} label="Goals created" />
      <ProfileStat value={stats.ideasCreated} label="Ideas created" />
      <ProfileStat value={stats.commentsCreated} label="Comments created" />
      <ProfileStat value={stats.commentsReceived} label="Comments received" />
    </div>
    <div className="flex w-full gap-2">
      <ProfileStat value={stats.donationsReceived} label="Donations received" currency={currency} />
      <ProfileStat value={stats.donated} label="Donated" currency={currency} />
    </div>
  </div>
);

export default Stats;
