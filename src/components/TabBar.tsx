import React, { ReactElement, useMemo } from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { FadeIn } from 'react-native-reanimated';

import { receiveIcon, sendIcon } from '../assets/icons/tabs';
import { showBottomSheet } from '../store/actions/ui';
import { resetSendTransaction } from '../store/actions/wallet';
import { betaRiskAcceptedSelector } from '../store/reselect/user';
import { viewControllersSelector } from '../store/reselect/ui';
import useColors from '../hooks/colors';
import { Text02M } from '../styles/text';
import { ScanIcon } from '../styles/icons';
import { AnimatedView } from '../styles/components';
import BlurView from '../components/BlurView';
import type { RootNavigationProp } from '../navigation/types';

const TabBar = ({
	navigation,
}: {
	navigation: RootNavigationProp;
}): ReactElement => {
	const { white08 } = useColors();
	const insets = useSafeAreaInsets();
	const { t } = useTranslation('wallet');
	const betaRiskAccepted = useSelector(betaRiskAcceptedSelector);
	const viewControllers = useSelector(viewControllersSelector);

	const shouldHide = useMemo(() => {
		const activityFilterSheets = ['timeRangePrompt', 'tagsPrompt'];
		return activityFilterSheets.some((view) => viewControllers[view].isOpen);
	}, [viewControllers]);

	const onReceivePress = (): void => {
		if (betaRiskAccepted) {
			showBottomSheet('receiveNavigation');
		} else {
			navigation.navigate('BetaRisk');
		}
	};

	const onSendPress = (): void => {
		// make sure we start with a clean transaction state
		resetSendTransaction();
		showBottomSheet('sendNavigation');
	};

	const onScanPress = (): void => navigation.navigate('Scanner');

	const borderStyles = useMemo(() => {
		const androidStyles = {
			borderColor: white08,
			borderTopColor: '#272727',
			borderBottomColor: '#272727',
		};

		const iosStyles = {
			borderColor: white08,
		};
		return Platform.OS === 'android' ? androidStyles : iosStyles;
	}, [white08]);

	const bottom = useMemo(() => Math.max(insets.bottom, 16), [insets.bottom]);
	const sendXml = useMemo(() => sendIcon('white'), []);
	const receiveXml = useMemo(() => receiveIcon('white'), []);

	if (shouldHide) {
		return <></>;
	}

	return (
		<AnimatedView
			style={[styles.tabRoot, { bottom }]}
			color="transparent"
			entering={FadeIn}>
			<TouchableOpacity
				style={styles.blurContainer}
				activeOpacity={0.8}
				testID="Send"
				onPress={onSendPress}>
				<BlurView style={styles.send}>
					<SvgXml xml={sendXml} width={13} height={13} />
					<Text02M style={styles.tabText}>{t('send')}</Text02M>
				</BlurView>
			</TouchableOpacity>
			<TouchableOpacity
				style={[styles.tabScan, borderStyles]}
				activeOpacity={0.8}
				testID="Scan"
				onPress={onScanPress}>
				<ScanIcon width={32} height={32} color="gray2" />
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.blurContainer}
				activeOpacity={0.8}
				testID="Receive"
				onPress={onReceivePress}>
				<BlurView style={styles.receive}>
					<SvgXml xml={receiveXml} width={13} height={13} />
					<Text02M style={styles.tabText}>{t('receive')}</Text02M>
				</BlurView>
			</TouchableOpacity>
		</AnimatedView>
	);
};

const styles = StyleSheet.create({
	tabRoot: {
		position: 'absolute',
		left: 16,
		right: 16,
		height: 80,
		flexDirection: 'row',
		alignItems: 'center',
		// fix TabBar zIndex on Android
		zIndex: 0,
	},
	blurContainer: {
		height: 56,
		flex: 1,
	},
	send: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingRight: 30,
		borderRadius: 30,
	},
	receive: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		paddingLeft: 30,
		borderRadius: 30,
	},
	tabScan: {
		height: 80,
		width: 80,
		backgroundColor: '#101010',
		borderRadius: 40,
		borderWidth: 2,
		marginHorizontal: -40,
		alignItems: 'center',
		justifyContent: 'center',
		zIndex: 1,
	},
	tabText: {
		marginLeft: 6,
	},
});

export default TabBar;
