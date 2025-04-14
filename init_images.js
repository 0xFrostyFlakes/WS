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

async function initImages() {
  for (let i = 0; i < NFT_MINT_ADDRESSES.length; i++) {
    const mintAddress = new PublicKey(NFT_MINT_ADDRESSES[i]);
    const nft = await metaplex.nfts().findByMint({ mintAddress });

    const initialUri = IMAGE_URLS[i].poor;

    await metaplex.nfts().update({
      nftOrSft: nft,
      uri: initialUri,
      name: `WealthShift Test #${i + 1}`,
      symbol: 'WSTEST',
      sellerFeeBasisPoints: 550
    });

    console.log(`Initialized NFT ${mintAddress.toBase58()} with URI: ${initialUri}`);
    fs.appendFileSync('init.log', `${new Date().toISOString()} - Initialized ${mintAddress.toBase58()} with URI: ${initialUri}\n`);
  }
}

initImages().catch(console.error);