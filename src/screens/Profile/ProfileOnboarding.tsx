import React, {
	memo,
	ReactElement,
	ReactNode,
	useCallback,
	useState,
} from 'react';
import { View, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { Trans, useTranslation } from 'react-i18next';

import { Display, BodyM, BodyS } from '../../styles/text';
import { View as ThemedView } from '../../styles/components';
import NavigationHeader from '../../components/NavigationHeader';
import Button from '../../components/Button';
import SafeAreaInset from '../../components/SafeAreaInset';
import { TSlashtagsState } from '../../store/types/slashtags';
import SwitchRow from '../../components/SwitchRow';
import { updateSettings } from '../../store/slices/settings';
import { setOnboardingProfileStep } from '../../store/slices/slashtags';
import DetectSwipe from '../../components/DetectSwipe';
import type {
	RootStackParamList,
	RootStackScreenProps,
} from '../../navigation/types';
import {
	selectedNetworkSelector,
	selectedWalletSelector,
} from '../../store/reselect/wallet';
import { updateSlashPayConfig2 } from '../../utils/slashtags2';

const crownImageSrc = require('../../assets/illustrations/crown.png');
const coinsImageSrc = require('../../assets/illustrations/coins.png');

export const ProfileIntro = memo(
	({ navigation }: RootStackScreenProps<'Profile'>): ReactElement => {
		const { t } = useTranslation('slashtags');

		return (
			<Layout
				navigation={navigation}
				illustration={crownImageSrc}
				nextStep="InitialEdit"
				buttonText={t('continue')}
				header={t('profile')}>
				<Display>
					<Trans
						t={t}
						i18nKey="onboarding_profile1_header"
						components={{ accent: <Display color="brand" /> }}
					/>
				</Display>
				<BodyM color="white50" style={styles.introText}>
					{t('onboarding_profile1_text')}
				</BodyM>
			</Layout>
		);
	},
);

export const OfflinePayments = ({
	navigation,
}: RootStackScreenProps<'Profile'>): ReactElement => {
	const { t } = useTranslation('slashtags');
	const dispatch = useAppDispatch();
	const selectedWallet = useAppSelector(selectedWalletSelector);
	const selectedNetwork = useAppSelector(selectedNetworkSelector);
	const [enableOfflinePayments, setOfflinePayments] = useState(true);

	const savePaymentConfig = useCallback((): void => {
		dispatch(updateSettings({ enableOfflinePayments }));
		updateSlashPayConfig2({ selectedWallet, selectedNetwork });
	}, [enableOfflinePayments, selectedNetwork, selectedWallet, dispatch]);

	return (
		<Layout
			navigation={navigation}
			illustration={coinsImageSrc}
			nextStep="Done"
			buttonText={t('continue')}
			header={t('profile_pay_contacts')}
			onNext={savePaymentConfig}>
			<Display>
				<Trans
					t={t}
					i18nKey="onboarding_profile2_header"
					components={{ accent: <Display color="brand" /> }}
				/>
			</Display>
			<BodyM color="white50" style={styles.introText}>
				{t('onboarding_profile2_text')}
			</BodyM>

			<View style={styles.enableOfflineRow}>
				<SwitchRow
					isEnabled={enableOfflinePayments}
					showDivider={false}
					onPress={(): void => setOfflinePayments(!enableOfflinePayments)}>
					<BodyM>{t('offline_enable')}</BodyM>
				</SwitchRow>
				<BodyS color="white50">{t('offline_enable_explain')}</BodyS>
			</View>
		</Layout>
	);
};

const Layout = memo(
	({
		navigation,
		illustration,
		nextStep,
		buttonText,
		header,
		children,
		onNext,
	}: {
		navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
		illustration: ImageSourcePropType;
		nextStep: TSlashtagsState['onboardingProfileStep'];
		buttonText: string;
		header: string;
		children: ReactNode;
		onNext?: () => void;
	}): ReactElement => {
		const dispatch = useAppDispatch();

		const onSwipeLeft = (): void => {
			navigation.navigate('Wallet');
		};

		return (
			<ThemedView style={styles.root}>
				<SafeAreaInset type="top" />
				<NavigationHeader
					title={header}
					displayBackButton={true}
					onClosePress={(): void => {
						navigation.navigate('Wallet');
					}}
				/>
				<DetectSwipe onSwipeLeft={onSwipeLeft}>
					<View style={styles.content}>
						<View style={styles.imageContainer}>
							<Image source={illustration} style={styles.image} />
						</View>
						<View style={styles.middleContainer}>{children}</View>
						<View style={styles.buttonContainer}>
							<Button
								style={styles.button}
								text={buttonText}
								size="large"
								testID="OnboardingContinue"
								onPress={(): void => {
									onNext?.();
									dispatch(setOnboardingProfileStep(nextStep));
								}}
							/>
						</View>
					</View>
				</DetectSwipe>
				<SafeAreaInset type="bottom" minPadding={16} />
			</ThemedView>
		);
	},
);

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
	content: {
		flex: 1,
		justifyContent: 'space-between',
		paddingHorizontal: 32,
	},
	imageContainer: {
		flexShrink: 1,
		alignItems: 'center',
		alignSelf: 'center',
		aspectRatio: 1,
		marginTop: 'auto',
	},
	image: {
		flex: 1,
		resizeMode: 'contain',
	},
	introText: {
		marginTop: 4,
	},
	middleContainer: {
		marginTop: 'auto',
	},
	buttonContainer: {
		flexDirection: 'row',
		marginTop: 32,
	},
	button: {
		flex: 1,
	},
	enableOfflineRow: {
		marginTop: 25,
	},
});
