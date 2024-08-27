import { Avatar, Input } from '@heathmont/moon-core-tw';
import Card from '../Card';

const AddPostCard = ({ onClick, avatarUrl }) => (
  <Card>
    <div className="flex gap-4 w-full items-center">
      <Avatar size="lg" imageUrl={avatarUrl} className="rounded-full shrink-0" />
      <Input placeholder="What do you want to share with the charity?" onClick={onClick} className="bg-goten cursor-pointer" onKeyDown={(e) => e.preventDefault()} />
    </div>
  </Card>
);

export default AddPostCard;
