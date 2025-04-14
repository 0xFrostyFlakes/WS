const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity } = require('@metaplex-foundation/js');
const fs = require('fs');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('/home/kuduro/.config/solana/devnet.json', 'utf8'))));
const metaplex = Metaplex.make(connection).use(keypairIdentity(keypair));

async function mintNFTs() {
  const nfts = [
    {
      name: 'WealthShift Test #1',
      symbol: 'WSTEST',
      description: 'A test NFT that shifts between Rich and Poor every 10 minutes.',
      uri: 'https://i.ibb.co/rf56KHTP/poor-1.png',
      sellerFeeBasisPoints: 550,
      collection: { name: 'WealthShift Test NFTs', family: 'Test NFTs' }
    },
    {
      name: 'WealthShift Test #2',
      symbol: 'WSTEST',
      description: 'A test NFT that shifts between Rich and Poor every 10 minutes.',
      uri: 'https://i.ibb.co/1SDsW4D/poor-2.png',
      sellerFeeBasisPoints: 550,
      collection: { name: 'WealthShift Test NFTs', family: 'Test NFTs' }
    }
  ];

  for (const nft of nfts) {
    const { nft: mintedNFT } = await metaplex.nfts().create({
      uri: nft.uri,
      name: nft.name,
      symbol: nft.symbol,
      description: nft.description,
      sellerFeeBasisPoints: nft.sellerFeeBasisPoints,
      collection: null // Simplified for now
    });
    console.log(`Minted: ${mintedNFT.address.toBase58()}`);
    fs.appendFileSync('mint_addresses.txt', `NFT: ${mintedNFT.address.toBase58()}\n`);
  }
}

mintNFTs().catch(console.error);