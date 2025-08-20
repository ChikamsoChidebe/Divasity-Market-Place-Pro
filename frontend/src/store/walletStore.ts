import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface Wallet {
  id: string;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  currency: string;
  statistics: {
    totalDeposited: number;
    totalWithdrawn: number;
    totalInvested: number;
    totalReturns: number;
  };
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  date: string;
  createdAt: string;
}

interface WalletState {
  wallet: Wallet | null;
  transactions: Transaction[];
  balance: number;
  isLoading: boolean;
  setWallet: (wallet: Wallet) => void;
  updateBalance: (balance: number) => void;
  addTransaction: (transaction: Transaction) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setLoading: (loading: boolean) => void;
  fetchWalletData: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  deposit: (amount: number, method: string) => Promise<void>;
  withdraw: (amount: number, method: string) => Promise<void>;
  clearWallet: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      wallet: null,
      transactions: [],
      balance: 0,
      isLoading: false,

      setWallet: (wallet: Wallet) => {
        set({ wallet });
      },

      updateBalance: (balance: number) => {
        const currentWallet = get().wallet;
        if (currentWallet) {
          set({
            wallet: { ...currentWallet, balance, availableBalance: balance },
          });
        }
      },

      addTransaction: (transaction: Transaction) => {
        set((state) => ({
          transactions: [transaction, ...state.transactions.slice(0, 49)],
        }));
      },

      setTransactions: (transactions: Transaction[]) => {
        set({ transactions });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      fetchWalletData: async () => {
        set({ isLoading: true });
        try {
          // Mock API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          const mockWallet: Wallet = {
            id: '1',
            balance: 0,
            availableBalance: 0,
            lockedBalance: 0,
            currency: 'USD',
            statistics: {
              totalDeposited: 0,
              totalWithdrawn: 0,
              totalInvested: 0,
              totalReturns: 0
            }
          };
          set({ wallet: mockWallet, balance: mockWallet.balance, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      fetchTransactions: async () => {
        set({ isLoading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 800));
          const mockTransactions: Transaction[] = [];
          set({ transactions: mockTransactions, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      deposit: async (amount: number, method: string) => {
        set({ isLoading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'deposit',
            amount,
            status: 'completed',
            description: `Deposit via ?{method}`,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          };
          const currentBalance = get().balance;
          set({ 
            balance: currentBalance + amount,
            isLoading: false 
          });
          get().addTransaction(newTransaction);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      withdraw: async (amount: number, method: string) => {
        set({ isLoading: true });
        try {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const newTransaction: Transaction = {
            id: Date.now().toString(),
            type: 'withdrawal',
            amount,
            status: 'completed',
            description: `Withdrawal to ?{method}`,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
          };
          const currentBalance = get().balance;
          set({ 
            balance: currentBalance - amount,
            isLoading: false 
          });
          get().addTransaction(newTransaction);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      clearWallet: () => {
        set({
          wallet: null,
          transactions: [],
          balance: 0
        });
      },
    }),
    {
      name: 'divasity-wallet',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wallet: state.wallet,
        transactions: state.transactions.slice(0, 10),
      }),
    }
  )
);
