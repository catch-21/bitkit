import React, { ReactElement } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Display } from '../../styles/text';
import OnboardingScreen from '../../components/OnboardingScreen';
import type { OnboardingStackScreenProps } from '../../navigation/types';

const imageSrc = require('../../assets/illustrations/phone.png');

const MultipleDevices = ({
	navigation,
}: OnboardingStackScreenProps<'MultipleDevices'>): ReactElement => {
	const { t } = useTranslation('onboarding');

	return (
		<OnboardingScreen
			title={
				<Trans
					t={t}
					i18nKey="multiple_header"
					components={{ accent: <Display color="yellow" /> }}
				/>
			}
			description={t('multiple_text')}
			image={imageSrc}
			buttonText={t('understood')}
			testID="MultipleDevices"
			onButtonPress={(): void => {
				navigation.navigate('RestoreFromSeed');
			}}
		/>
	);
};

export default MultipleDevices;
