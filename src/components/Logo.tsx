import React, { memo } from 'react';
import Icon from 'react-native-vector-icons/dist/Entypo';
import colors from '../styles/colors';

const Logo = () => <Icon name="circle" size={80} color={colors.orange} />;

export default memo(Logo, () => true);