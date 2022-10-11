//import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, BN, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from './idl.json';

import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useWallet, WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Buffer } from 'buffer';
window.Buffer = Buffer;
require('@solana/wallet-adapter-react-ui/styles.css');




const wallets = [ new PhantomWalletAdapter() ]

const { SystemProgram, Keypair } = web3;
const opts = {
  preflightCommitment: "processed"
}
const programID = new PublicKey(idl.metadata.address);

function App() {
  const wallet = useWallet()
  const [walletKey, setWalletKey] = useState(null);

  const [txUrl, settxUrl] = useState(null);

  console.log("im here");


  const qetProvider = () => {
    if ("solana" in window) {
      const provider = window.solana;
      if (provider.isPhantom) {
        return provider;
      }
    }
  };

  const connectWallet = async () => {
    const provider = qetProvider();
    if (provider) {
      try {
        const response = await provider.connect();
        const pubKey = await provider.publicKey;
        console.log("adasdd", pubKey);

        setWalletKey(response.publicKey.toString());
      } catch (err) {
        console.log("buradaym");
        // { code: 4001, message: 'User rejected the request.' }
      }
    }
  };

  useEffect(() => connectWallet, []);


  async function getProvider() {
    /* create the provider and return it to the caller */
    /* network set to local network for now */
    const network = "https://solana-mainnet.g.alchemy.com/v2/R1-IwhGrl4VYwrD3QhTUMdbfWTOlrsXl";
    const connection = new Connection(network, opts.preflightCommitment);

    const provider = new AnchorProvider(
      connection, wallet, opts.preflightCommitment,
    );


    return provider;
  }

  async function initialize() {
    const provider = await getProvider();
    /* create the program interface combining the idl, program ID, and provider */
    const program = new Program(idl, programID, provider);

    const [campaign] = await web3.PublicKey.findProgramAddress([Buffer.from("claimsol"), program.provider.wallet.publicKey.toBuffer()],program.programId);
    console.log("program.provider.wallet.publicKey", program.provider.wallet.publicKey.toString());

    try {
      /* interact with the program via rpc */
      const txx = await program.rpc.create(new BN(3 * web3.LAMPORTS_PER_SOL), {
        accounts: {
          campaign,
          //user: program.provider.wallet.publicKey, //Önemli : eğer user program provider ise signature ihtiyaç duymaz. fakat farklı bir account tarafından sign ediliyorsa o zaman signers kısmında
          claimstatus: program.provider.wallet.publicKey,
          user: program.provider.wallet.publicKey.toBuffer(),
          systemProgram: SystemProgram.programId,
        },});
      console.log("txx", txx);

    } catch (err) {
      console.log("Transaction error: ", err);
    }
  }

  async function withdraw() {

    const provider = await getProvider();
    const program = new Program(idl, programID, provider);


    console.log(provider);

    const pubKey = await provider.publicKey;


    console.log("provider.wallet.publicKey.toBuffer()", provider.wallet.publicKey.toBuffer());

    console.log("pubKey",pubKey.toString());
    console.log("provider.wallet", provider.wallet);



    var recieverWallet = new web3.PublicKey("6387HgpKsjYNrvNfLpbK9UuuWbLP2Mr998hMEBMD9BS1");


    var [campaignq] = await web3.PublicKey.findProgramAddress([Buffer.from("claimsol"), recieverWallet.toBuffer()], program.programId);

    const txxyy = await program.rpc.withdraw(new BN(0.1 * web3.LAMPORTS_PER_SOL),{
        accounts: {
          campaign:campaignq,
          claimstatus: provider.publicKey.toString(),
          //user: program.provider.wallet.publicKey, //Önemli : eğer user program provider ise signature ihtiyaç duymaz. fakat farklı bir account tarafından sign ediliyorsa o zaman signers kısmında
          user: provider.publicKey.toString(),
          systemProgram: SystemProgram.programId,
        },

      });

      console.log("txxyy", txxyy);


  }

  if (!wallet.connected) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop:'100px' }}>
        <WalletMultiButton />
      </div>
    )
  } else {
    return (
      <div className="App">
        <div>

          { <center> <img src="airderop.svg" /> </center> }

          {<h2>Just claim your solana or hfsp.</h2>}


          {<h2>Connected account</h2>}

          {<h2> {walletKey}</h2>}

          {/*  { <button onClick={initialize}>Initialize</button> } */}
          { <button onClick={withdraw}>Claim 0.1 sol</button> }


          {<h2> {txUrl} </h2>}


        </div>
      </div>
    );
  }
}

const AppWithProvider = () => (
  <ConnectionProvider endpoint="https://solana-mainnet.g.alchemy.com/v2/R1-IwhGrl4VYwrD3QhTUMdbfWTOlrsXl">
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <App />
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
)

export default AppWithProvider;
