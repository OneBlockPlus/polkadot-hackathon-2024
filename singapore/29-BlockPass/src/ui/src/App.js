import AppRoutes from "./AppRoutes";
import { WalletProvider } from "./wallet-context";

function App() {
  return (
    <WalletProvider>
      <AppRoutes />
    </WalletProvider>
  );
}

export default App;
