import { connectToElectrum, getMnemonicPhrase, refreshWallet } from '../wallet';
import { createWallet, updateWallet } from '../../store/actions/wallet';
import { err, ok, Result } from '../result';
import { InteractionManager } from 'react-native';
import { getStore } from '../../store/helpers';
import { backupSetup, performFullBackup } from '../../store/actions/backup';
import { startOmnibolt } from '../omnibolt';
import {
	startLnd,
	updateCachedNeutrinoDownloadState,
} from '../../store/actions/lightning';
import lndCache from '@synonymdev/react-native-lightning/dist/utils/neutrino-cache';
import { ENetworks as LndNetworks } from '@synonymdev/react-native-lightning/dist/utils/types';
import { showErrorNotification } from '../notifications';

export const checkWalletExists = async (): Promise<void> => {
	const response = await getMnemonicPhrase('wallet0');
	let walletExists = false;
	if (response.isOk() && !!response.value) {
		walletExists = true;
	}
	await updateWallet({ walletExists });
};

/**
 * Creates a new wallet from scratch
 * @returns {Promise<Ok<string> | Err<string>>}
 */
export const createNewWallet = async (): Promise<Result<string>> => {
	//All seeds will get automatically created
	return await startWalletServices();
};

/**
 * Callback passed to startLnd to be called after RPC is ready
 * @returns {Promise<void>}
 */
const backupServiceStart = async (): Promise<void> => {
	const res = await backupSetup();
	if (res.isErr()) {
		showErrorNotification({
			title: 'Failed to verify remote backup. Retrying...',
			message: res.error.message,
		});
	}
	performFullBackup({ retries: 3, retryTimeout: 2000 }).then();
};

/**
 * Starts all wallet services
 * @returns {Promise<Err<unknown> | Ok<string>>}
 */
export const startWalletServices = async (): Promise<Result<string>> => {
	try {
		InteractionManager.runAfterInteractions(async () => {
			//Create wallet if none exists.
			let { wallets, selectedNetwork, selectedWallet } = getStore().wallet;
			const walletKeys = Object.keys(wallets);
			if (!wallets[walletKeys[0]] || !wallets[walletKeys[0]]?.id) {
				await createWallet({});
			}

			const electrumResponse = await connectToElectrum({ selectedNetwork });
			if (electrumResponse.isOk()) {
				refreshWallet().then();
			}

			//Create and start omnibolt.
			startOmnibolt({ selectedWallet }).then();

			let lndNetwork = LndNetworks.testnet;
			if (selectedNetwork === 'bitcoin') {
				lndNetwork = LndNetworks.mainnet;
			}

			lndCache.addStateListener(updateCachedNeutrinoDownloadState);
			lndCache
				.downloadCache(lndNetwork)
				//Start LND no matter the outcome of the download
				.finally(async () => {
					await startLnd(lndNetwork, backupServiceStart);
				});
		});

		return ok('Wallet started');
	} catch (e) {
		return err(e);
	}
};
