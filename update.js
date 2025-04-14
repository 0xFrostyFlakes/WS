const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('/home/kuduro/.config/solana/devnet.json', 'utf8'))));
const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

const NFT_MINT_ADDRESSES = [
  '9KhjHs4ZYCRkn4pEJ4Np9sihWiTfbNRur7H4oAJcZ8E3', // NFT #1
  '4qY4Em3W63Wwzp2UZAw3B6oaCZSPUU6QZTDNBVLhX3bJ'  // NFT #2
];

const IMAGE_URLS = {
  0: {
    rich: 'https://i.ibb.co/KcSk04b5/rich-1.png',
    poor: 'https://i.ibb.co/rf56KHTP/poor-1.png'
  },
  1: {
    rich: 'https://i.ibb.co/NdsMzDYD/rich-2.png',
    poor: 'https://i.ibb.co/1SDsW4D/poor-2.png'
  }
};

const BALANCE_FILE = 'sol_balances.json';

async function getNFTOwner(mintAddress) {
  const largestAccounts = await connection.getTokenLargestAccounts(new PublicKey(mintAddress));
  const ownerAccount = largestAccounts.value.find(acc => acc.amount.toString() === '1');
  if (!ownerAccount) {
    console.log(`No owner found for NFT ${mintAddress.toBase58()}`);
    return null;
  }
  const tokenAccountInfo = await connection.getAccountInfo(new PublicKey(ownerAccount.address));
  const owner = new PublicKey(tokenAccountInfo.data.slice(32, 64));
  console.log(`NFT ${mintAddress.toBase58()} token account: ${ownerAccount.address}, owner: ${owner.toBase58()}`);
  return owner;
}

async function getSolBalance(wallet) {
  const balance = wallet ? (await connection.getBalance(wallet)) / 1e9 : 0;
  console.log(`Wallet ${wallet ? wallet.toBase58() : 'None'} balance: ${balance} SOL (Devnet)`);
  return balance;
}

function loadPreviousBalances() {
  try {
    if (fs.existsSync(BALANCE_FILE)) {
      const data = fs.readFileSync(BALANCE_FILE, 'utf8');
      return JSON.parse(data);
    }
    return {}; // Return empty object if file doesn’t exist
  } catch (err) {
    console.error(`Failed to load balances: ${err}`);
    return {};
  }
}

function saveCurrentBalances(balances) {
  try {
    fs.writeFileSync(BALANCE_FILE, JSON.stringify(balances), 'utf8');
    console.log(`Saved balances: ${JSON.stringify(balances)}`);
  } catch (err) {
    console.error(`Failed to save balances: ${err}`);
  }
}

async function updateNFTImages() {
  const previousBalances = loadPreviousBalances();
  console.log(`Loaded previous balances: ${JSON.stringify(previousBalances)}`);
  const currentBalances = {};

  for (let i = 0; i < NFT_MINT_ADDRESSES.length; i++) {
    const mintAddress = new PublicKey(NFT_MINT_ADDRESSES[i]);
    const nft = await metaplex.nfts().findByMint({ mintAddress });
    const owner = await getNFTOwner(mintAddress);
    const ownerKey = owner ? owner.toBase58() : 'unknown';
    const currentBalance = await getSolBalance(owner);
    const previousBalance = previousBalances[ownerKey] !== undefined ? previousBalances[ownerKey] : currentBalance; // Use current if no previous
    const netChange = currentBalance - previousBalance;

    const newStatus = netChange >= 0 ? 'Rich' : 'Poor';
    const newUri = IMAGE_URLS[i][newStatus.toLowerCase()];

    if (nft.uri !== newUri) {
      await metaplex.nfts().update({
        nftOrSft: nft,
        uri: newUri,
        name: nft.name,
        symbol: nft.symbol,
        sellerFeeBasisPoints: 550
      });
      console.log(`Updated NFT ${mintAddress.toBase58()} to ${newStatus} (Owner: ${ownerKey}, Balance: ${currentBalance} SOL, Change: ${netChange} SOL)`);
      fs.appendFileSync('update.log', `${new Date().toISOString()} - Updated ${mintAddress.toBase58()} to ${newStatus} (Owner: ${ownerKey}, Balance: ${currentBalance} SOL, Change: ${netChange} SOL)\n`);
    } else {
      console.log(`No update needed for NFT ${mintAddress.toBase58()} - Already ${newStatus}`);
    }

    currentBalances[ownerKey] = currentBalance;
  }

  saveCurrentBalances(currentBalances);
}

setInterval(() => {
  updateNFTImages().catch(err => {
    console.error('Update failed:', err);
    fs.appendFileSync('error.log', `${new Date().toISOString()} - Error: ${err}\n`);
  });
}, 10 * 60 * 1000);

updateNFTImages().catch(console.error);