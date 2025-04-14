Here's how it worked in devnet: 

## Solana Environment setup
Solana CLI installed via sh -c "$(curl -sSfL https://release.anza.xyz/v1.18.4/install)".
Set to Devnet: solana config set --url https://api.devnet.solana.com.

## Created a Devnet wallet:
solana-keygen new --outfile ~/.config/solana/devnet.json.
Public key will be visible - save it 
Funded with 0.1 SOL (though faucets).

## Install node dependancies
npm init -y and npm install @solana/web3.js @metaplex-foundation/js typescript ts-node axios in wealthshift-nfts/.

## Make and upload images
poor-1.png, poor-2.png, rich-1.png, rich-2.png (made these manually).
https://i.ibb.co/rf56KHTP/poor-1.png
https://i.ibb.co/1SDsW4D/poor-2.png
https://i.ibb.co/KcSk04b5/rich-1.png
https://i.ibb.co/NdsMzDYD/rich-2.png

## Prepared Metadata for Minting
Created metadata files in wealthshift-nfts/assets/:

## Mint the NFTs Using Metaplex JS
Ran:
node mint.js.
2 NFTs minted on Devnet.
Mint addresses saved in wealthshift-nfts/mint_addresses.txt.
Visible in Devnet Explorer

## Update the nft from poor to rich or vice-versa with script
the script scrapes the wallet balance and compares to prior (only uses the sol amount here in devnet)
node wealthshift-nfts/update.js



