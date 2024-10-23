import Navigator from './components/navigator';
import Slide from './components/slide';
import Points from './components/points';
import Protocol from './components/protocol';
import Demo from './components/demo';
import Plinth from './components/plinth';
import Loader from './components/loader';
//import Join from './components/join';
import Gateway from './components/gateway';
import Sample from './components/sample';
import Footer from './components/footer';

import data from './data';

function App() {
  return (
    <div>
      <Navigator />
      <Slide list={data.slide}/>
      <Points list={data.points}/>
      <Protocol subject={data.protocol.subject} list={data.protocol.list}/>
      <Loader subject={data.loader.subject} backend={data.loader.backend} frontend={data.loader.frontend} />
      <Plinth subject={data.plinth.subject} list={data.plinth.list}/>
      <Demo list={data.demo}/>
      <Gateway subject={data.gateway}/>
      <Sample list={data.sample.list} desc={data.sample.desc}/>
      {/* <Join /> */}
      <Footer />
    </div>
  );
}

export default App;
