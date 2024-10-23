import { ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SetWalletPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleConfirmPasswordChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setConfirmPassword(event.target.value);
  };

  const handleConfirm = () => {
    navigate("/create-wallet");
  };
  

  return (
    <div className="flex flex-col w-full h-full justify-between py-4">
      <h3 className="text-4xl leading-none tracking-tight">Set Your Wallet</h3>
      <div className="pb-6">
        <div>
          <label className="text-sm font-medium" htmlFor="name">
            Name
          </label>
          <Input
            id="name"
            className="mt-1"
            value={name}
            onChange={handleNameChange}
          />
        </div>
        <div className="mt-2">
          <label className="text-sm font-medium" htmlFor="password">
            Password
          </label>
          <Input
            id="password"
            className="mt-1"
            value={password}
            onChange={handlePasswordChange}
            type="password"
          />
        </div>
        <div className="mt-2">
          <label className="text-sm font-medium" htmlFor="password">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            className="mt-1"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            type="password"
          />
        </div>
      </div>
      <div className="flex gap-x-4">
        <Button variant="outline" className="w-full">
          Cancel
        </Button>
        <Button variant="default" className="w-full" onClick={handleConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default SetWalletPage;
