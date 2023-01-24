import React, { ReactElement, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Display, Text01S } from '../../styles/text';
import { IColors } from '../../styles/colors';
import { restoreRemoteBackups, startWalletServices } from '../../utils/startup';
import { sleep } from '../../utils/helpers';
import { useSelectedSlashtag } from '../../hooks/slashtags';
import { updateUser } from '../../store/actions/user';
import GlowingBackground from '../../components/GlowingBackground';
import SafeAreaInsets from '../../components/SafeAreaInsets';
import GlowImage from '../../components/GlowImage';
import Button from '../../components/Button';
import LoadingWalletScreen from './Loading';
import { showErrorNotification } from '../../utils/notifications';
import Dialog from '../../components/Dialog';

const checkImageSrc = require('../../assets/illustrations/check.png');
const crossImageSrc = require('../../assets/illustrations/cross.png');

let attemptedAutoRestore = false;

const RestoringScreen = (): ReactElement => {
	const [showRestored, setShowRestored] = useState(false);
	const [showFailed, setShowFailed] = useState(false);
	const [proceedWBIsLoading, setProceedWBIsLoading] = useState(false);
	const [tryAgainCount, setTryAgainCount] = useState(0);
	const [showCautionDialog, setShowCautionDialog] = useState(false);
	const slashtag = useSelectedSlashtag();

	const onRemoteRestore = useCallback(async (): Promise<void> => {
		attemptedAutoRestore = true;
		setShowFailed(false);
		setShowRestored(false);

		const res = await restoreRemoteBackups(slashtag.slashtag);
		await sleep(1000);
		if (res.isErr()) {
			return setShowFailed(true);
		}

		setShowRestored(true);
	}, [slashtag]);

	const proceedWithoutBackup = useCallback(async () => {
		setShowCautionDialog(false);
		setProceedWBIsLoading(true);
		const res = await startWalletServices({ restore: false });
		if (res.isErr()) {
			showErrorNotification({
				title: 'Error: Unable to proceed without a backup',
				message: res.error.message,
			});
			return;
		}
		setProceedWBIsLoading(false);
		// This will navigate the user to the main wallet view once startWalletServices has run successfully.
		updateUser({ requiresRemoteRestore: false });
	}, []);

	useEffect(() => {
		if (attemptedAutoRestore) {
			return;
		}

		onRemoteRestore().then();
	}, [onRemoteRestore]);

	let color: keyof IColors = 'brand';
	let content = <LoadingWalletScreen />;

	if (showRestored || showFailed) {
		color = showRestored ? 'green' : 'red';
		const title = showRestored ? 'Wallet Restored.' : 'Failed to restore.';
		const subtitle = showRestored
			? 'You have successfully restored your wallet from backup. Enjoy Bitkit!'
			: 'Failed to recover backed up data.';
		const imageSrc = showRestored ? checkImageSrc : crossImageSrc;
		const buttonText = showRestored ? 'Get Started' : 'Try Again';

		const onPress = (): void => {
			if (showRestored) {
				//App.tsx will show wallet now
				updateUser({ requiresRemoteRestore: false });
			} else {
				onRemoteRestore().then().catch(console.error);
				setTryAgainCount(tryAgainCount + 1);
			}
		};

		content = (
			<View style={styles.content}>
				<Display style={styles.title}>{title}</Display>
				<Text01S color="white8">{subtitle}</Text01S>

				<GlowImage image={imageSrc} imageSize={200} glowColor={color} />

				<View style={styles.buttonContainer}>
					<Button onPress={onPress} size="large" text={buttonText} />
					{tryAgainCount > 1 && showFailed && (
						<Button
							loading={proceedWBIsLoading}
							style={styles.proceedButton}
							onPress={(): void => {
								setShowCautionDialog(true);
							}}
							size="large"
							text="Proceed Without Backup"
						/>
					)}
				</View>

				<Dialog
					visible={showCautionDialog}
					title="Are You Sure?"
					description="If you previously had a lightning backup it will be overwritten and lost. This could result in a loss of funds."
					confirmText="Yes, Proceed"
					onCancel={(): void => {
						setShowCautionDialog(false);
					}}
					onConfirm={proceedWithoutBackup}
				/>

				<SafeAreaInsets type="bottom" />
			</View>
		);
	}

	return <GlowingBackground topLeft={color}>{content}</GlowingBackground>;
};

const styles = StyleSheet.create({
	content: {
		flex: 1,
		paddingHorizontal: 48,
		paddingTop: 120,
		paddingBottom: 16,
	},
	title: {
		marginBottom: 8,
	},
	buttonContainer: {
		marginTop: 'auto',
	},
	proceedButton: {
		marginTop: 5,
	},
});

export default RestoringScreen;
