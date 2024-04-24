import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Display } from '../styles/text';
import OnboardingScreen from '../components/OnboardingScreen';
import { openURL } from '../utils/helpers';
import { useAppDispatch } from '../hooks/redux';
import { hideTodo } from '../store/slices/todos';
import type { RootStackScreenProps } from '../navigation/types';

const imageSrc = require('../assets/illustrations/bitcoin-emboss.png');

const BuyBitcoin = ({
	navigation,
}: RootStackScreenProps<'BuyBitcoin'>): ReactElement => {
	const { t } = useTranslation('other');
	const dispatch = useAppDispatch();

	return (
		<OnboardingScreen
			title={
				<Trans
					t={t}
					i18nKey="buy_header"
					components={{ accent: <Display color="brand" /> }}
				/>
			}
			description={t('buy_text')}
			image={imageSrc}
			buttonText={t('buy_button')}
			testID="BuyBitcoin"
			onClosePress={(): void => {
				navigation.navigate('Wallet');
			}}
			onButtonPress={(): void => {
				dispatch(hideTodo('buyBitcoin'));
				openURL('https://bitcoin.org/en/exchanges');
			}}
		/>
	);
};

export default BuyBitcoin;
