import { Dropdown, MenuItem } from '@heathmont/moon-core-tw';
import Card from '../../components/components/Card';
import { useEffect, useState } from 'react';
import { usePolkadotContext } from '../../contexts/PolkadotContext';
import useEnvironment from '../../contexts/EnvironmentContext';

const options = [{ id: 'most_donations_received', label: 'Received donations' }];

export const TopCommunityMembers = ({ daoId, allJoined, goals }) => {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const { api, getUserInfoById } = usePolkadotContext();
  const [items, setItems] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const { getCurrency } = useEnvironment();

  async function fetchContractData() {
    setisLoading(true);

    try {
      if (api && goals.length > 0) {
        let Members = [];
        for (let i = 0; i < allJoined.length; i++) {
          const element = allJoined[i];
          let userInfo = await getUserInfoById(element.user_id);
          let UserCreatedGoals = goals.filter((e) => Number(e.UserId) == Number(element.user_id));

          let totalDonations = 0;
          UserCreatedGoals.forEach((e) => (totalDonations += e.reached));
          Members.push({
            userid: element.user_id,
            name: userInfo?.fullName?.toString(),
            amount: Number(totalDonations)
          });
        }
        setItems(Members);
        setisLoading(false);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchContractData();
  }, [api, allJoined, goals]);

  return (
    <Card className="flex flex-col gap-4 w-[236px] h-fit">
      <h5 className="text-trunks text-moon-14">Top charity members by</h5>
      <Dropdown value={selectedOption} onChange={setSelectedOption}>
        {({ open }) => (
          <>
            <Dropdown.Select className="bg-gohan" open={open}>
              {selectedOption?.label}
            </Dropdown.Select>

            <Dropdown.Options>
              {options.map((option, index) => (
                <Dropdown.Option value={option} key={index}>
                  {({ selected, active }) => (
                    <MenuItem isActive={active} isSelected={selected}>
                      <MenuItem.Title>{option.label}</MenuItem.Title>
                    </MenuItem>
                  )}
                </Dropdown.Option>
              ))}
            </Dropdown.Options>
          </>
        )}
      </Dropdown>

      {selectedOption.id === 'most_donations_received' && (
        <>
          {' '}
          <div className="flex flex-col gap-1">
            {items.map((donator, index) => (
              <div className="flex justify-between items-center border-b pb-1 border-goku last-of-type:border-0" key={index}>
                <div className="flex flex-col gap-1">
                  <div className="text-piccolo">{donator.name}</div>
                  <div className="text-moon-12">
                    {getCurrency()} {donator.amount}
                  </div>
                </div>
                <div>{index + 1}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

export default TopCommunityMembers;
