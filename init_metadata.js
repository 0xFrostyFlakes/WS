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

async function getNFTOwner(mintAddress) {
  const largestAccounts = await connection.getTokenLargestAccounts(new PublicKey(mintAddress));
  const ownerAccount = largestAccounts.value.find(acc => acc.amount.toString() === '1');
  return ownerAccount ? new PublicKey(ownerAccount.address) : null;
}

async function getSolBalance(wallet) {
  return wallet ? (await connection.getBalance(wallet)) / 1e9 : 0;
}

async function initMetadata() {
  for (let i = 0; i < NFT_MINT_ADDRESSES.length; i++) {
    const mintAddress = new PublicKey(NFT_MINT_ADDRESSES[i]);
    const nft = await metaplex.nfts().findByMint({ mintAddress });
    const owner = await getNFTOwner(mintAddress);
    const initialBalance = await getSolBalance(owner);

    const metadata = {
      name: `WealthShift Test #${i + 1}`,
      symbol: 'WSTEST',
      description: 'A test NFT that shifts based on SOL balance.',
      image: IMAGE_URLS[i].poor,
      attributes: [
        { trait_type: 'ID', value: (i + 1).toString() },
        { trait_type: 'Status', value: 'Poor' },
        { trait_type: 'Portfolio Value', value: initialBalance.toFixed(4) },
        { trait_type: 'Net Change', value: '0' },
        { trait_type: 'Owner', value: owner ? owner.toBase58() : 'Unknown' }
      ],
      collection: { name: 'WealthShift Test NFTs', family: 'Test NFTs' }
    };

    // Save JSON locally
    fs.writeFileSync(`wealthshift-nfts/metadata_${i}_initial.json`, JSON.stringify(metadata));
    console.log(`Saved metadata_${i}_initial.json - Upload to ImgBB and replace URI below`);

    // Replace with your ImgBB URL after uploading
    const newUri = 'YOUR_IMGBB_URL_HERE'; // e.g., https://i.ibb.co/xxx/metadata-0-initial-json

    await metaplex.nfts().update({
      nftOrSft: nft,
      uri: newUri,
      name: `WealthShift Test #${i + 1}`,
      symbol: 'WSTEST',
      sellerFeeBasisPoints: 550
    });

    console.log(`Initialized NFT ${mintAddress.toBase58()} with URI: ${newUri}`);
    fs.appendFileSync('init.log', `${new Date().toISOString()} - Initialized ${mintAddress.toBase58()} with URI: ${newUri}\n`);
  }
}

initMetadata().catch(console.error);