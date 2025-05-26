import { ThemeProvider } from "@/components/theme-provider";
import StakingPageClient from "@/components/StakingPageClient";
import { WalletProvider } from "@/context/wallet-context";

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="stakefin-theme"
    >
      <WalletProvider>
        <StakingPageClient />
      </WalletProvider>
    </ThemeProvider>
  );
}
