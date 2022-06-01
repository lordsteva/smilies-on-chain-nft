# Smilies On-chain

An on-chain NFT project where a new Smiley is minted every day and is available on an auction! Every buyer receives Smiley Voting Tokens which makes them a member of the Smiley DAO where all collected ETH is stored. 

## The project is deployed [HERE](https://earnest-naiad-422c27.netlify.app/)
<details>
  <summary><h3>Rinkeby contract addresses:</h3></summary>

- Smiley Auction: [0x25195989c1c09d5c1f98c6cbb44cb2faee3ddd59](https://rinkeby.etherscan.io/address/0x25195989c1c09d5c1f98c6cbb44cb2faee3ddd59#code)
- Smiley Governor: [0xc3616fc4deb35e272827fb1795f1a11bbe39a6bc](https://rinkeby.etherscan.io/address/0xc3616fc4deb35e272827fb1795f1a11bbe39a6bc#code)
- Smiley NFT: [0x6713537662e09fb4cefb1d14756e6997b873856b](https://rinkeby.etherscan.io/address/0x6713537662e09fb4cefb1d14756e6997b873856b#code)
- TimeLock: [0x6c20b37c5a101df60aa3ce8fdc02cdf9bbb3e85c](https://rinkeby.etherscan.io/address/0x6c20b37c5a101df60aa3ce8fdc02cdf9bbb3e85c#code)
- Smiley Voting Token: [0x1087ddab599c867c1cd1f9368090f39276bba89f](https://rinkeby.etherscan.io/address/0x1087ddab599c867c1cd1f9368090f39276bba89f#code)
- SmileyAttribute (Background): [0x1d8c89f24cf7c95072dad5387c0db7a7e2c68876](https://rinkeby.etherscan.io/address/0x1d8c89f24cf7c95072dad5387c0db7a7e2c68876#code)
- SmileyAttribute (Face): [0xd0f6fe2c16dc8b35151288da8bf7f34c153afec9](https://rinkeby.etherscan.io/address/0xd0f6fe2c16dc8b35151288da8bf7f34c153afec9#code) 
- SmileyAttribute (Eyes): [0xebabcc7355bafee5e708e34db670c3fec2ab24ac](https://rinkeby.etherscan.io/address/0xebabcc7355bafee5e708e34db670c3fec2ab24ac#code)
- SmileyAttribute (Mouth): [0xab79535b9841551a7da1f3ba9a8720155490723a](https://rinkeby.etherscan.io/address/0xab79535b9841551a7da1f3ba9a8720155490723a#code)
- SmileyAttribute (Moustache): [0xababf2dc71f66e4191f95f75272f50bfbf6c3cf5](https://rinkeby.etherscan.io/address/0xababf2dc71f66e4191f95f75272f50bfbf6c3cf5#code)
- SmileyAttribute (Hat): [0xa932f2f6d4c2366cc88e575b5ec47219e441754c](https://rinkeby.etherscan.io/address/0xa932f2f6d4c2366cc88e575b5ec47219e441754c#code)
</details>

## How to start locally?
### Tools needed:
- [NPM](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install) (installation: npm i -g yarn)
- [Metamask](https://metamask.io/) Chrome extension
### Configure Metamask to use localhost network:
- Choose Add Network option inside Metamask neworks display
- Add a new network with following data:
  - Network Name: localhost
  - New RPC URL: http://localhost:8545
  - Chain ID: 1337
  - Currency Symbol: ETH 
- Import any of the Hardaht localhost accounts:
    - 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
    - 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    - 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
    - more can be found in [Hardhat docs](https://hardhat.org/getting-started)

### Deploy project
- open terminal inside the root folder
- run ```yarn```
- run ```npx hardhat node```
- open another terminal tab/window in the root folder
- run ```npx hardhat deploy``` (make sure you do this before running frontend since this steps add .env file)
- run ```cd frontend/smiley-on-chain```
- run ```yarn```
- run ```yarn dev```
- go to http://127.0.0.1:3000/
