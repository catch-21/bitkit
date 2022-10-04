import { TAssetNetwork } from './wallet';
import { IActivityItem } from './activity';

export type TViewController =
	| 'sendNavigation'
	| 'receiveNavigation'
	| 'numberPadSend'
	| 'numberPadReceive'
	| 'backupPrompt'
	| 'backupNavigation'
	| 'PINPrompt'
	| 'PINNavigation'
	| 'boostPrompt'
	| 'activityTagsPrompt'
	| 'newTxPrompt'
	| 'profileAddDataForm'
	| 'profileAddLink'
	| 'addContactModal'
	| 'slashauthModal';

export type TUserViewController = {
	[key in TViewController]: IViewControllerData;
};

export interface IViewControllerData {
	isOpen: boolean;
	id?: string;
	asset?: string;
	assetNetwork?: TAssetNetwork;
	snapPoint?: number;
	activityItem?: IActivityItem;
	txid?: string;
	showLaterButton?: boolean;
	url?: string;
}

export interface IUser {
	loading: boolean;
	error: boolean;
	isHydrated: boolean;
	isOnline: boolean;
	isConnectedToElectrum: boolean;
	ignoreBackupTimestamp: number;
	backupVerified: boolean;
	viewController: TUserViewController;
}
