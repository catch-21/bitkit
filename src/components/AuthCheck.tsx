import React, { memo, ReactElement, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useAppSelector } from '../hooks/redux';
import { RouteProp } from '@react-navigation/native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { View as ThemedView } from '../styles/components';
import Biometrics from './Biometrics';
import PinPad from './PinPad';
import { biometricsSelector } from '../store/reselect/settings';

type AuthCheckProps = {
	showBackNavigation?: boolean;
	showLogoOnPIN?: boolean;
	route?: RouteProp<{ params: { requirePin: boolean; onSuccess: () => void } }>;
	onSuccess?: () => void;
};

/**
 * This component checks if the user has enabled pin or biometrics and runs through each check as needed before proceeding.
 */
const AuthCheck = ({
	showBackNavigation = true,
	showLogoOnPIN = false,
	route,
	onSuccess,
}: AuthCheckProps): ReactElement => {
	const biometrics = useAppSelector(biometricsSelector);
	const [requireBiometrics, setRequireBiometrics] = useState(biometrics);

	const requirePin = route?.params?.requirePin ?? false;
	onSuccess = route?.params?.onSuccess ?? onSuccess;

	if (requireBiometrics && !requirePin) {
		return (
			<Animated.View style={StyleSheet.absoluteFillObject} exiting={FadeOut}>
				<ThemedView style={styles.root}>
					<Biometrics
						onSuccess={(): void => onSuccess?.()}
						onFailure={(): void => setRequireBiometrics(false)}
					/>
				</ThemedView>
			</Animated.View>
		);
	}

	return (
		<Animated.View style={StyleSheet.absoluteFillObject} exiting={FadeOut}>
			<PinPad
				showBackNavigation={showBackNavigation}
				showLogoOnPIN={showLogoOnPIN}
				allowBiometrics={biometrics && !requirePin}
				onShowBiotmetrics={(): void => setRequireBiometrics(true)}
				onSuccess={(): void => onSuccess?.()}
			/>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	root: {
		flex: 1,
	},
});

export default memo(AuthCheck);
