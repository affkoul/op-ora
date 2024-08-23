// interface Window {
//   ethereum?: {
//     isMetaMask?: boolean;
//     request?: (...args: any[]) => Promise<any>;
//     on?: (event: string, callback: (...args: any[]) => void) => void;
//   };
// }

interface EthereumProvider {
  isMetaMask?: boolean;
  request?: (args: {
    method: string;
    params?: any[] | Record<string, any>;
  }) => Promise<any>;
  on?: (event: string, listener: (...args: any[]) => void) => void;
  removeListener?: (event: string, listener: (...args: any[]) => void) => void;
  off?: (event: string, listener: (...args: any[]) => void) => void;
}

interface Window {
  ethereum?: EthereumProvider;
}
