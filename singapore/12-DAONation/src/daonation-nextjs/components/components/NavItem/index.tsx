import { Button } from '@heathmont/moon-core-tw';
import Link from 'next/link';
import { MouseEventHandler } from 'react';

const NavItem = ({ link, label, highlight, onClick }: { link?: string; label: string; highlight?: boolean; onClick?: MouseEventHandler }) => {
  const LinkedButton = () => (
    <Link href={link}>
      <Button style={{ background: 'none', border: '0px', color: 'black', fontWeight: highlight ? 600 : 400 }} onClick={onClick}>
        {label}
      </Button>
    </Link>
  );

  const StandaloneButton = () => (
    <Button style={{ background: 'none', border: '0px', color: 'black', fontWeight: highlight ? 600 : 400, textDecoration: 'none', listStyle: 'none' }} onClick={onClick}>
      {label}
    </Button>
  );

  return <li>{link ? LinkedButton() : StandaloneButton()}</li>;
};

export default NavItem;
