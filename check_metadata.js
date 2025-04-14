const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex } = require('@metaplex-foundation/js');
const fs = require('fs');

const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
const keypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync('/home/kuduro/.config/solana/devnet.json', 'utf8'))));
const metaplex = Metaplex.make(connection);

const MINT_ADDRESSES = [
  '9KhjHs4ZYCRkn4pEJ4Np9sihWiTfbNRur7H4oAJcZ8E3',
  '4qY4Em3W63Wwzp2UZAw3B6oaCZSPUU6QZTDNBVLhX3bJ'
];

async function checkMetadata() {
  for (const mint of MINT_ADDRESSES) {
    const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(mint) });
    console.log(`NFT ${mint}:`);
    console.log(`- Name: ${nft.name}`);
    console.log(`- URI: ${nft.uri}`);
    console.log(`- JSON: ${JSON.stringify(nft.json, null, 2)}`);
  }
}

checkMetadata().catch(console.error);