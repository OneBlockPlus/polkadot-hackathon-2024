import { Avatar } from '@heathmont/moon-core-tw';
import { formatDistance } from 'date-fns';
import { useState } from 'react';
import UseFormTextArea from '../UseFormTextArea';
import { GenericUser } from '@heathmont/moon-icons-tw';
import Link from 'next/link';

const CommentBox = ({ address, user_info, date, message, replies = [], sendReply, MessageIndex, MessageID }) => {
  const [reply, setreply] = useState(false);
  const [Reply, ReplyInput, setReply] = UseFormTextArea({
    defaultValue: '',
    placeholder: 'Your Reply',
    id: '',
    name: 'reply',
    rows: 3,
    minHeight: 70
  });

  function replyToComment() {
    setreply(!reply);
  }

  async function PostReply(e) {
    e.preventDefault();

    await sendReply(Reply, MessageID, MessageIndex);

    setReply('');
  }

  return (
    <div className="flex flex-col gap-2" data-id={MessageID}>
      <div className="flex justify-between items-center">
        <div className="flex gap-1 items-center">
          {user_info?.imgIpfs !== '' ? (
            <img src={user_info?.imgIpfs} alt="" className="rounded-full border-2 w-12 h-12 object-cover border-piccolo" />
          ) : (
            <Avatar size="sm" className="rounded-full border border-piccolo bg-gohan">
              <GenericUser className="text-moon-24" />
            </Avatar>
          )}

          <Link className="text-piccolo max-w-[120px] truncate" href={`/profile/${user_info?.id}`} rel="noreferrer" target="_blank">
            {user_info?.fullName?.toString()}
          </Link>
        </div>
        <span className="whitespace-nowrap text-trunks text-moon-14">{formatDistance(new Date(date), new Date(), { addSuffix: true })}</span>
      </div>
      <div className="bg-gohan rounded-moon-i-md ml-[36px] p-2">
        <p>{message}</p>
        {/* <section className={style.PostMenuArea}>
          <nav className="post-controls collapsed">
            <div className="actions">
              <button onClick={replyToComment} style={{ lineHeight: 1, display: 'inline-block' }}>
                <svg id="reply" className={style.reply} style={{ fill: 'var(--foreground)' }} viewBox="0 0 492.425 492.425" xmlSpace="preserve">
                  <path
                    d="M228.398,137.833V92.355c0.008-9.697-5.364-18.611-13.946-23.123c-8.576-4.529-18.959-3.935-26.964,1.541
L10.172,192.148C3.821,196.497,0.014,203.679,0,211.369c-0.025,7.692,3.733,14.903,10.052,19.286l177.283,122.947
c7.99,5.559,18.405,6.201,27.02,1.688c8.623-4.512,14.019-13.424,14.027-23.156v-38.301
c93.167,2.682,174.585,50.617,221.525,122.049c5.484,8.334,15.963,12.189,25.775,9.475c9.805-2.713,16.629-11.371,16.726-21.262
c0.009-0.885,0.017-1.768,0.017-2.65C492.425,258.31,374.944,142.091,228.398,137.833z"
                  />
                </svg>
                <span className="d-button-label">Reply</span>
              </button>
            </div>
          </nav>
        </section> */}
      </div>
      {/* {replies.map((item, index) => (
          <div key={item.id} className="row read-reply" data-id={item.id} style={{ display: 'flex', justifyContent: 'center', padding: '1rem', paddingLeft: '4rem', paddingRight: '0' }}>
            <div className={style.topicAvatar}>
              <div className="post-avatar">
                <a className="trigger-user-card main-avatar " href={`/profile/${item.address}`} rel="noreferrer" target="_blank" aria-hidden="true" tabIndex={-1}>
                  <svg width={45} height={45} xmlns="http://www.w3.org/2000/svg" style={{ fill: 'var(--foreground)' }} viewBox="0 0 459 459">
                    <g>
                      <g>
                        <path d="M229.5,0C102.53,0,0,102.845,0,229.5C0,356.301,102.719,459,229.5,459C356.851,459,459,355.815,459,229.5    C459,102.547,356.079,0,229.5,0z M347.601,364.67C314.887,393.338,273.4,409,229.5,409c-43.892,0-85.372-15.657-118.083-44.314    c-4.425-3.876-6.425-9.834-5.245-15.597c11.3-55.195,46.457-98.725,91.209-113.047C174.028,222.218,158,193.817,158,161    c0-46.392,32.012-84,71.5-84c39.488,0,71.5,37.608,71.5,84c0,32.812-16.023,61.209-39.369,75.035    c44.751,14.319,79.909,57.848,91.213,113.038C354.023,354.828,352.019,360.798,347.601,364.67z" />
                      </g>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
            <div className={style.clearfix}>
              <div role="heading" className={style.TopicMetaData}>
                <div className={style.TriggerUserCard}>
                  <span className="font-bold text-piccolo">
                    <a href={`/profile/${item.address}`} style={{ color: 'var(--title-a-text)' }} rel="noreferrer" target="_blank">
                      {item.address}
                    </a>
                  </span>
                </div>
                <div className={style.PostInfos}>
                  <div className="post-info post-date" style={{ flex: '0 0 auto', marginRight: 0 }}>
                    <a className="widget-link post-date" title="Post date">
                      <span style={{ whiteSpace: 'nowrap' }}>{formatDistance(new Date(item.date), new Date(), { addSuffix: true })}</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="regular contents" style={{ position: 'relative' }}>
                <div className={style.cooked}>
                  <p>{item.message}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {reply === true ? (
          <form onSubmit={PostReply} style={{ padding: '0rem 0px 1rem 4rem', width: '100%', display: 'flex', flexDirection: 'column', rowGap: '1rem' }}>
            {ReplyInput}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button data-element-id="btn_donate" style={{ width: '135px' }} data-analytic-event-listener="true" type="submit">
                Post Reply
              </Button>
            </div>
          </form>
        ) : (
          <></>
        )} */}
    </div>
  );
};

export default CommentBox;
