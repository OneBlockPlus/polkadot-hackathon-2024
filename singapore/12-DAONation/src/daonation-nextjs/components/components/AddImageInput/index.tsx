import { Button } from '@heathmont/moon-core-tw';
import { GenericPicture } from '@heathmont/moon-icons-tw';

const AddImageInput = ({ onClick, className = '' }) => (
  <Button className={`bg-goku min-h-[120px] w-[180px] text-trunks border border-beerus rounded-moon-i-xs ${className}`} onClick={onClick} variant="secondary" style={{ height: 80, padding: '1.5rem', boxShadow: 'none' }} iconLeft={<GenericPicture className="text-moon-24" />} size="lg">
    Add image
  </Button>
);

export default AddImageInput;
