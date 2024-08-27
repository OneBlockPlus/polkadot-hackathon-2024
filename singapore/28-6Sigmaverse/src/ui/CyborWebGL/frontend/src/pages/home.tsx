import { Container } from '@/components';
import { Count } from '@/features/count/count';
import { UnityComponent } from '@/features/cyborgame/maingame';

export default function Home() {
  return (
    <Container>
      {/* <Count /> */}
      <UnityComponent/>
    </Container>
  );
};
