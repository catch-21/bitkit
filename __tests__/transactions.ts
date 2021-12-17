import {
	createWallet,
	setupOnChainTransaction,
	updateOnChainTransaction,
	updateWallet,
} from '../src/store/actions/wallet';
import { getSelectedWallet } from '../src/utils/wallet';
import { TAvailableNetworks } from '../src/utils/networks';
import { mnemonic, walletState } from './utils/dummy-wallet';
import {
	createFundedPsbtTransaction,
	createTransaction,
	signPsbt,
} from '../src/utils/wallet/transactions';
import { lnrpc } from '@synonymdev/react-native-lightning';

describe('On chain transactions', () => {
	beforeAll(async () => {
		//Seed wallet data including utxo and transaction data
		await createWallet({
			mnemonic,
			addressAmount: 5,
			changeAddressAmount: 5,
		});

		await updateWallet({ wallets: { wallet0: walletState } });

		await setupOnChainTransaction({});
	});

	it('Creates an on chain transaction from the transaction store', async () => {
		const selectedNetwork: TAvailableNetworks = 'bitcoinTestnet';
		const selectedWallet = getSelectedWallet();

		await updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				outputs: [
					{
						value: 10001,
						index: 0,
						address: '2N4Pe5o1sZKcXdYC3JVVeJKMXCmEZgVEQFa',
					},
				],
			},
		});

		const res = await createTransaction({
			selectedNetwork,
			selectedWallet,
		});

		if (res.isErr()) {
			expect(res.error.message).toEqual('');
			return;
		}

		expect(res.value).toEqual(
			'020000000001020c0eab3149ba3ed7abd8f4c98eabe2cbb2b7c3590404b66ca0f01addf61ec67100000000000000000051bd848851cadb71bf34e6e0e46b0c4214c2d06ccc1d5ca0f5baefdcf862692000000000000000000002112700000000000017a9147a40d326e4de19353e2bf8b3f15b395c88b2d24187bdcc010000000000160014669a9323418693b81d44c19da7b1fe7911b2142902483045022100f178c62e0e334a510bcc7c8c29d7b9d5baf38f0b07139c3666dda7fb7b2fd06e022058191a429d4495e7d38636999903d86aba009e8411540bbc70631edda500bb9601210318cb16a8e659f378002e75abe93f064c4ebcd62576bc15019281b635f96840a802473044022003053bcfffd23ccae537cc7a6934e923deddafcb7a18cd72ac6e3e391bf78b7602202c4d4c15dcdd23cbd583780712e6b71f993af0c21f23faf28fae207d70a3debd012102bb6083f2571ecd26f68edeae341c0700463349a84b2044c271e061e813e0cd0300000000',
		);
	});

	it("Creates a PSBT with funding inputs (unsigned) usable by LND's fundingStateStep", async () => {
		const selectedNetwork: TAvailableNetworks = 'bitcoinTestnet';
		const selectedWallet = getSelectedWallet();

		//Real funding tx detail from a Lnd node
		const lndPsbtResponse = lnrpc.ReadyForPsbtFunding.create({
			fundingAddress:
				'tb1q2j82upcszm9qtjjy7q845hvqgg3apmmkxnap6qmcn0ry8gn0kgvqvqwzxn',
			fundingAmount: 123456,
		});

		await updateOnChainTransaction({
			selectedNetwork,
			selectedWallet,
			transaction: {
				outputs: [
					{
						value: Number(lndPsbtResponse.fundingAmount),
						index: 0,
						address: lndPsbtResponse.fundingAddress,
					},
				],
			},
		});

		//Create a funded PSBT that'll be verified by LND
		const fundedPsbtRes = await createFundedPsbtTransaction({
			selectedWallet,
			selectedNetwork,
		});

		if (fundedPsbtRes.isErr()) {
			expect(fundedPsbtRes.error.message).toBeUndefined();
			return;
		}

		expect(fundedPsbtRes.value.toBase64()).toEqual(
			'cHNidP8BAKYCAAAAAgwOqzFJuj7Xq9j0yY6r4suyt8NZBAS2bKDwGt32HsZxAAAAAAAAAAAAUb2EiFHK23G/NObg5GsMQhTC0GzMHVyg9brv3PhiaSAAAAAAAAAAAAACQOIBAAAAAAAiACBUjq4HEBbKBcpE8A9aXYBCI9DvdjT6HQN4m8ZDom+yGI4RAAAAAAAAFgAUZpqTI0GGk7gdRMGdp7H+eRGyFCkAAAAAAAEBH0DiAQAAAAAAFgAUm5iywlEvl4nZkQqRtDFLIUs1mDIAAQEfjhIAAAAAAAAWABQcXF2QWgJ2ysNHP1M+3dw0nAWaQwAAAA==',
		);

		//Sign the PSBT for LND finalization
		const signedPsbtRes = await signPsbt({
			selectedWallet,
			selectedNetwork,
			psbt: fundedPsbtRes.value,
		});

		if (signedPsbtRes.isErr()) {
			expect(signedPsbtRes.error.message).toBeUndefined();
			return;
		}

		expect(signedPsbtRes.value.toBase64()).toEqual(
			'cHNidP8BAKYCAAAAAgwOqzFJuj7Xq9j0yY6r4suyt8NZBAS2bKDwGt32HsZxAAAAAAAAAAAAUb2EiFHK23G/NObg5GsMQhTC0GzMHVyg9brv3PhiaSAAAAAAAAAAAAACQOIBAAAAAAAiACBUjq4HEBbKBcpE8A9aXYBCI9DvdjT6HQN4m8ZDom+yGI4RAAAAAAAAFgAUZpqTI0GGk7gdRMGdp7H+eRGyFCkAAAAAAAEBH0DiAQAAAAAAFgAUm5iywlEvl4nZkQqRtDFLIUs1mDIBCGsCRzBEAiBnDcK3Gm0MQfInWZNOwslIgelRO09RRvTkNYkNMEY3kAIgcESxzERDpp3h7nNh19YS+avrFYO69h63Lylns0LYQBgBIQMYyxao5lnzeAAudavpPwZMTrzWJXa8FQGSgbY1+WhAqAABAR+OEgAAAAAAABYAFBxcXZBaAnbKw0c/Uz7d3DScBZpDAQhsAkgwRQIhAJjaH3qoUDKKDERHrpD3CY6rPOGQnp5yxBQCMM5iF60bAiAbWoc7+DUxn/UbycVJ4UVo2vEQqhUxTKpKgDOwgsHXQQEhArtgg/JXHs0m9o7erjQcBwBGM0moSyBEwnHgYegT4M0DAAAA',
		);
	});
});