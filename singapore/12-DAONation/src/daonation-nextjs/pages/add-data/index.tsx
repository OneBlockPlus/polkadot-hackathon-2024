import { Button } from '@heathmont/moon-core-tw';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usePolkadotContext } from '../../contexts/PolkadotContext';

const AllUsers = [
  {
    FullName: 'Zakir Hossen',
    Email: 'zakiristesting@gmail.com',
    Password: '12345678',
    metadata: 'https://lh3.googleusercontent.com/a/ACg8ocIMcjUA-y_lKy1GGpC5S6azg7rn2Kh84HaNKKH0D5aqlt6smg=s288-c-no'
  }
];

const AllCharities = [
  {
    wallet: '5HBgU6yBy49MT6FC2g8v2YFZnw4FmpQa2ER997gA5M4tJbWX',
    metadata: {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        Title: { type: 'string', description: 'Feeding America' },
        Description: { type: 'string', description: 'Here goes the DAO description' },
        Start_Date: { type: 'string', description: '8/17/2024' },
        logo: { type: 'string', description: { url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafkreicguxof5vnszbfgotxhgnbulmrjcuifourdvu6r336l5ofejy7az4?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/png' } },
        wallet: { type: 'string', description: '5EEeMmY9B37Zwio7Q9t9EizBK5bCX9VgKRSA49zZB8zjsuXd' },
        user_id: { type: 'string', description: '0' },
        SubsPrice: { type: 'number', description: '5' },
        typeimg: { type: 'string', description: 'Dao' },
        Created_Date: { type: 'string', description: '8/17/2024' },
        allFiles: [{ url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafkreicguxof5vnszbfgotxhgnbulmrjcuifourdvu6r336l5ofejy7az4?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/png' }]
      }
    }
  }
];
const AllEvents = [
  {
    metadata: {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        Title: { type: 'string', description: 'Woodland Trust' },
        Description: { type: 'string', description: 'We protect. We fight to protect woods and trees, preventing the loss of irreplaceable habitat, nature and carbon stores for a healthier future for everyone.' },
        Budget: { type: 'string', description: '100' },
        End_Date: { type: 'string', description: '2024-08-19' },
        user_id: { type: 'string', description: '0' },
        wallet: { type: 'string', description: '5HBgU6yBy49MT6FC2g8v2YFZnw4FmpQa2ER997gA5M4tJbWX' },
        logo: { type: 'string', description: { url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafkreic3bhlqzoctehlgoszwcgse54wiyal56zp2qv546jeandgrm3jmz4?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/jpeg' } },
        eventStreamUrl: { type: 'string', description: '' },
        ticketPrice: { type: 'string', description: '' },
        eventType: { type: 'string', description: 'auction' },
        allFiles: [{ url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafkreic3bhlqzoctehlgoszwcgse54wiyal56zp2qv546jeandgrm3jmz4?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/jpeg' }]
      }
    },
    daoId: 0,
    userid: 0,
    feed: { name: 'Zakir Hossen', daoId: 0, eventid: 0, budget: '100' }
  }
];
const AllGoals = [
  {
    wallet: '5HBgU6yBy49MT6FC2g8v2YFZnw4FmpQa2ER997gA5M4tJbWX',
    metadata: {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        Title: { type: 'string', description: 'Community food security in Texas' },
        Description: {
          type: 'string',
          description:
            'Community food security in Texas" aims to ensure that every Texan has consistent access to nutritious food, free from the constraints of financial limitations or geographical barriers. This objective involves multifaceted strategies, including addressing food insecurity by implementing programs for food distribution, meal assistance, and nutrition education targeted at vulnerable communities. Beyond mere sustenance, the objective emphasizes the importance of promoting nutritional health, offering diverse and wholesome food options to support the overall well-being of individuals and families.'
        },
        Budget: { type: 'string', description: '1500' },
        End_Date: { type: 'string', description: '2024-08-16' },
        user_id: { type: 'string', description: '0' },
        wallet: { type: 'string', description: '5HBgU6yBy49MT6FC2g8v2YFZnw4FmpQa2ER997gA5M4tJbWX' },
        logo: { type: 'string', description: { url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafkreibutdxyeqqmxcvtg5uvma2sfnwxtl23aigiian3g7wwwzcw3e4hm4?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/jpeg' } },
        allFiles: [{ url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafkreibutdxyeqqmxcvtg5uvma2sfnwxtl23aigiian3g7wwwzcw3e4hm4?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/jpeg' }]
      }
    },
    daoId: 0,
    userId: 0,
    feed: { name: 'Zakir Hossen', daoId: 0, goalid: 0, budget: '1500' }
  }
];

const AllIdeas = [
  {
    metadata: {
      title: 'Asset Metadata',
      type: 'object',
      properties: {
        Title: { type: 'string', description: 'Mobile Food Pantries' },
        Description: { type: 'string', description: 'Implementing mobile food pantry programs to bring fresh produce and nutritious food directly to underserved communities, particularly in rural areas or food deserts. Estimated cost: $50,000 per year per mobile unit, including vehicle maintenance, staff salaries, and food procurement.' },
        wallet: { type: 'string', description: '5HBgU6yBy49MT6FC2g8v2YFZnw4FmpQa2ER997gA5M4tJbWX' },
        user_id: { type: 'string', description: '0' },
        logo: { type: 'string', description: { url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafybeihy7cym7fqgpmsqll6ca6fxiizs6c73qvbtn4ej7rkawenuhubd6u?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/jpeg' } },
        allFiles: [{ url: 'https://aqua-dull-locust-679.mypinata.cloud/ipfs/bafybeihy7cym7fqgpmsqll6ca6fxiizs6c73qvbtn4ej7rkawenuhubd6u?pinataGatewayToken=v8BV9VKQs69NLLcVsQaw_fd_pcihpitKGBGpB13WTx40K9pHydzCcywsW0F1yAeL', type: 'image/jpeg' }]
      }
    },
    goalId: 0,
    daoId: 0,
    userId: 0,
    feed: { name: 'Zakir Hossen', goalTitle: 'Community food security in Texas', ideasid: 0, daoId: 0 }
  }
];

export default function AddData() {
  const [isAdding, setIsAdding] = useState(false);
  const { api, showToast, EasyToast, deriveAcc } = usePolkadotContext();

  async function AddUsers() {
    const ToastId = toast.loading(`Registering Users (${AllUsers.length})`);
    for (let i = 0; i < AllUsers.length; i++) {
      EasyToast(`Registering Users (${i + 1}/${AllUsers.length})`, 'pending', true, ToastId.toString(), true);

      const user = AllUsers[i];
      const newPromise = new Promise(async (resolve, reject) => {
        async function onSuccess() {
          resolve(true);
        }
        await api._extrinsics.users.registerUser(user.FullName, user.Email, user.Password, user.metadata).signAndSend(deriveAcc, ({ status }) => {
          showToast(status, ToastId, 'Registered Successfully!', onSuccess);
        });
      });
      await newPromise;
    }
    EasyToast('Registered All Users!', 'success', true, ToastId.toString());
  }

  async function AddCharities() {
    const ToastId = toast.loading(`Creating Charties (${AllCharities.length})`);
    for (let i = 0; i < AllCharities.length; i++) {
      EasyToast(`Creating Charties  (${i + 1}/${AllCharities.length})`, 'pending', true, ToastId.toString(), true);

      const charity = AllCharities[i];
      const newPromise = new Promise(async (resolve, reject) => {
        async function onSuccess() {
          resolve(true);
        }
        await api._extrinsics.daos.createDao(charity.wallet, JSON.stringify(charity.metadata), {}).signAndSend(deriveAcc, (status) => {
          showToast(status, ToastId, 'Created Successfully!', onSuccess);
        });
      });
      await newPromise;
    }
    EasyToast('Registered All Charities!', 'success', true, ToastId.toString());
  }
  async function AddEvents() {
    const ToastId = toast.loading(`Creating Events (${AllEvents.length})`);
    for (let i = 0; i < AllEvents.length; i++) {
      EasyToast(`Creating Events  (${i + 1}/${AllEvents.length})`, 'pending', true, ToastId.toString(), true);

      const event = AllEvents[i];
      const newPromise = new Promise(async (resolve, reject) => {
        async function onSuccess() {
          resolve(true);
        }

        const txs = [api._extrinsics.events.createEvent(JSON.stringify(event.metadata), Number(event.daoId), Number(event.userid)), api._extrinsics.feeds.addFeed(JSON.stringify(event.feed), 'event', new Date().valueOf())];

        await api.tx.utility.batch(txs).signAndSend(deriveAcc, (status) => {
          showToast(status, ToastId, 'Created Successfully!', onSuccess);
        });
      });
      await newPromise;
    }
    EasyToast('Created All Events!', 'success', true, ToastId.toString());
  }
  async function AddGoals() {
    const ToastId = toast.loading(`Creating Goals (${AllGoals.length})`);
    for (let i = 0; i < AllGoals.length; i++) {
      EasyToast(`Creating Goals  (${i + 1}/${AllGoals.length})`, 'pending', true, ToastId.toString(), true);

      const goal = AllGoals[i];
      const newPromise = new Promise(async (resolve, reject) => {
        async function onSuccess() {
          resolve(true);
        }
        const txs = [api._extrinsics.goals.createGoal(JSON.stringify(goal.metadata), goal.daoId, Number(goal.userId), JSON.stringify(goal.feed)), api._extrinsics.feeds.addFeed(JSON.stringify(goal.feed), 'goal', new Date().valueOf())];
        await api.tx.utility.batch(txs).signAndSend(deriveAcc, (status) => {
          showToast(status, ToastId, 'Created Successfully!', onSuccess);
        });
      });
      await newPromise;
    }
    EasyToast('Created All Goals!', 'success', true, ToastId.toString());
  }

  async function AddIdeas() {
    const ToastId = toast.loading(`Creating Ideas (${AllIdeas.length})`);
    for (let i = 0; i < AllIdeas.length; i++) {
      EasyToast(`Creating Ideas  (${i + 1}/${AllIdeas.length})`, 'pending', true, ToastId.toString(), true);

      const idea = AllIdeas[i];
      const newPromise = new Promise(async (resolve, reject) => {
        async function onSuccess() {
          resolve(true);
        }
        const txs = [api._extrinsics.ideas.createIdeas(JSON.stringify(idea.metadata), idea.goalId, idea.daoId, idea.userId, JSON.stringify(idea.feed)), api._extrinsics.feeds.addFeed(JSON.stringify(idea.feed), 'idea', new Date().valueOf())];

        await api.tx.utility.batch(txs).signAndSend(deriveAcc, (status) => {
          showToast(status, ToastId, 'Created successfully!', () => {
            onSuccess();
          });
        });
      });
      await newPromise;
    }
    EasyToast('Created All Ideas!', 'success', true, ToastId.toString());
  }

  async function AddDumpData() {
    setIsAdding(true);
    try {
      await AddUsers();
      await AddCharities();
      await AddGoals();
      await AddEvents();
      await AddIdeas();
    } catch (error) {
      console.error(error);
    }
    setIsAdding(false);
  }
  return (
    <>
      <div className="container flex flex-col-reverse h-[480px] items-center">
        <Button variant="secondary" onClick={AddDumpData} disabled={isAdding} className="!bg-transparent w-32">
          Add Data
        </Button>
      </div>
    </>
  );
}
