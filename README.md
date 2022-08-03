# Atomic NFT with Marketplace

This is an example of creating an AtomicNFT with a order book.

## What is an order book? 

An order book is a marketplace mechanism that allows owners to place their 
value for sale. Then allows other wallet users to purchase the AtomicNFT 
using a PST Coin that is paired with the Atomic NFT Contract.

## How does it work?

1. deploy the contract as an Atomic NFT
2. addPair to coin you would like to exchange for NFT
3. open asset in NFT Viewer
4. as the creator, createOrder with prices
5. as a buyer, transfer coin of target coin to creator
6. then call createOrder to get

## Deploy Contract

Modify the deploy script to fit your needs, you will need a wallet and you will need a NFT Asset, and complete the initial state for the deploy or mint.