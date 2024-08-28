import { Avatar, Button, IconButton, Modal, Textarea } from '@heathmont/moon-core-tw';
import { ControlsClose } from '@heathmont/moon-icons-tw';
import { useState } from 'react';
import AddImageInput from '../../components/components/AddImageInput';

const CreatePostModal = ({ show, onClose, avatarUrl, userName, communityName }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState('');

  function createPost() {
    setIsLoading(true);
    console.log('CREATE POST');
  }

  function uploadImage() {
    console.log('UPLOAD IMAGE');
  }

  return (
    <Modal open={show} onClose={onClose}>
      <Modal.Backdrop />
      <Modal.Panel className="bg-gohan w-[90%] max-w-[600px]">
        <div className={`flex items-center justify-center flex-col`}>
          <div className="flex justify-between items-center w-full border-b border-beerus py-4 px-6">
            <h1 className="text-moon-20 font-semibold">Create post</h1>
            <IconButton className="text-trunks" variant="ghost" icon={<ControlsClose />} onClick={onClose} />
          </div>

          <div className="flex flex-col gap-6 w-full p-8">
            <div className="flex gap-2 items-center">
              <Avatar size="lg" className="rounded-full" imageUrl={avatarUrl} />
              <div className="flex flex-col justify-between">
                <div>{userName}</div>
                <div className="text-trunks">
                  Posting in <strong>{communityName}</strong>
                </div>
              </div>
            </div>
            <Textarea placeholder="What do you want to share with the charity?" className="bg-goten min-h-[88px]" value={text} onChange={(e) => setText(e.target.value)} />

            <AddImageInput className="w-full !h-[200px]" onClick={uploadImage} />
          </div>

          <div className="flex justify-between border-t border-beerus w-full p-6">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={createPost} animation={isLoading ? 'progress' : null} disabled={isLoading || !text}>
              Create post
            </Button>
          </div>
        </div>
      </Modal.Panel>
    </Modal>
  );
};

export default CreatePostModal;
