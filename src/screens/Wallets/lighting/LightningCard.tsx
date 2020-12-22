/**
 * @format
 * @flow strict-local
 */

import React, { memo, useEffect, useState } from 'react';
import { LayoutAnimation, StyleSheet, TextInput } from 'react-native';
import { View, Text } from '../../../styles/components';
import Receive from './../Receive';
import Button from '../../../components/Button';
import AssetCard from '../../../components/AssetCard';
import Store from '../../../store/types';
import { useSelector } from 'react-redux';
import {
	connectToDefaultPeer,
	debugLightningStatusMessage,
	openMaxChannel,
} from '../../../utils/lightning';
import lnd from 'react-native-lightning';
import { payLightningInvoice } from '../../../store/actions/lightning';
import {
	showErrorNotification,
	showInfoNotification,
	showSuccessNotification,
} from '../../../utils/notifications';

const LightningCard = () => {
	const lightning = useSelector((state: Store) => state.lightning);
	const [message, setMessage] = useState('');
	const [receiveAddress, setReceiveAddress] = useState('');
	const [showInvoiceInput, setShowInvoiceInput] = useState(false);
	const [sendPaymentRequest, setSendPaymentRequest] = useState('');
	const [receivePaymentRequest, setReceivePaymentRequest] = useState('');

	LayoutAnimation.easeInEaseOut();

	//If user needs to wait for channel to be opened
	useEffect(() => {
		if (lightning.channelBalance.pendingOpenBalance > 0) {
			setMessage('Opening channel...');
		}
	}, [lightning.channelBalance]);

	//If the current invoice in view was just paid
	useEffect(() => {
		const currentInvoice = lightning.invoiceList.invoices.find(
			(inv) => inv.paymentRequest === receivePaymentRequest,
		);
		if (currentInvoice && currentInvoice.settled) {
			setMessage(`Invoice settled. Received ${currentInvoice.value} sats.`);
			setReceivePaymentRequest('');
		}
	}, [lightning.invoiceList, receivePaymentRequest]);

	useEffect(() => {
		if (!sendPaymentRequest) {
			return;
		}

		(async () => {
			const res = await lnd.decodeInvoice(sendPaymentRequest);
			if (res.isOk()) {
				setSendPaymentRequest('');
				setShowInvoiceInput(false);
				showInfoNotification({
					title: 'Paying invoice',
					message: `${res.value.numSatoshis} sats...`,
				});

				const payRes = await payLightningInvoice(sendPaymentRequest);
				if (payRes.isErr()) {
					setMessage(payRes.error.message);
					return;
				}

				showSuccessNotification({
					title: 'Paid!',
					message: `${res.value.numSatoshis} sats`,
				});
			}
		})();
	}, [sendPaymentRequest]);

	if (!lightning.onChainBalance || !lightning.channelBalance) {
		return null;
	}

	const showFundingButton =
		lightning.info.syncedToChain && lightning.onChainBalance.totalBalance === 0;
	const showSendReceive = lightning.channelBalance.balance > 0;

	//Show 'move to lightning button' if they have a confirmed on-chain balance but no channel balance
	const showOpenChannelButton =
		lightning.onChainBalance.confirmedBalance > 0 &&
		lightning.channelBalance.pendingOpenBalance === 0 &&
		lightning.channelBalance.balance === 0;

	const channelBalance = `${lightning.channelBalance.balance} sats`;
	const onChainBalance = `${lightning.onChainBalance.totalBalance} sats`;

	return (
		<AssetCard
			title="Lightning Wallet"
			description={`${debugLightningStatusMessage(lightning)}`}
			assetBalanceLabel={showSendReceive ? channelBalance : onChainBalance}
			fiatBalanceLabel="$0"
			asset="lightning">
			<>
				<View color="transparent" style={styles.buttonRow}>
					{!!showSendReceive && (
						<>
							<Button
								color="onSurface"
								style={styles.sendButton}
								onPress={() => {
									setShowInvoiceInput(!showInvoiceInput);
									setReceiveAddress('');
									setReceivePaymentRequest('');
									setMessage('');
								}}
								text="Send"
							/>
							<Button
								color="onSurface"
								style={styles.receiveButton}
								onPress={async () => {
									const res = await lnd.createInvoice(1, 'Spectrum test');

									if (res.isErr()) {
										return showErrorNotification({
											title: 'Failed to create invoice.',
											message: res.error.message,
										});
									}

									setReceivePaymentRequest(res.value.paymentRequest);
									setShowInvoiceInput(false);
									setMessage('');
									console.log(res.value.paymentRequest);
								}}
								text="Receive"
							/>
						</>
					)}

					{!!showFundingButton && (
						<Button
							color="onSurface"
							style={styles.fundButton}
							onPress={async () => {
								const res = await lnd.getAddress();
								if (res.isOk()) {
									setReceiveAddress(res.value.address);
									console.log(res.value.address);
								}
							}}
							text="Fund"
						/>
					)}

					{!!showOpenChannelButton && (
						<Button
							color="onSurface"
							style={styles.fundButton}
							onPress={async () => {
								setMessage('Connecting...');
								setReceiveAddress('');
								const connectRes = await connectToDefaultPeer();
								if (
									connectRes.isErr() &&
									connectRes.error.message.indexOf('already connected') === -1
								) {
									return showErrorNotification({
										title: 'Failed to move funds to lightning.',
										message: connectRes.error.message,
									});
								}

								showInfoNotification({ message: 'Connected to peer' });

								const openRes = await openMaxChannel();
								if (openRes.isErr()) {
									return setMessage(openRes.error.message);
								}

								showInfoNotification({
									title: 'Channel opened',
									message: 'Waiting for confirmations',
								});
							}}
							text="Move funds to lighting"
						/>
					)}
				</View>

				{!!message && <Text style={styles.message}>{message}</Text>}

				{!!showInvoiceInput && (
					<View>
						<TextInput
							onChangeText={(invoice) => setSendPaymentRequest(invoice)}
						/>
					</View>
				)}

				{!!receiveAddress && (
					<Receive address={receiveAddress} header={false} />
				)}

				{!!receivePaymentRequest && (
					<Receive address={receivePaymentRequest} header={false} />
				)}
			</>
		</AssetCard>
	);
};

const styles = StyleSheet.create({
	buttonRow: {
		flexDirection: 'row',
		marginTop: 10,
	},
	sendButton: {
		flex: 1,
		marginRight: 5,
	},
	receiveButton: {
		flex: 1,
		marginLeft: 5,
	},
	fundButton: {
		flex: 1,
		marginLeft: 5,
	},
	message: {
		textAlign: 'center',
		marginTop: 10,
		marginBottom: 10,
	},
});

export default memo(LightningCard);