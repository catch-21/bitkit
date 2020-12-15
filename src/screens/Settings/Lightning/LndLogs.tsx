import React, { memo, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
	View,
	Feather,
	Text,
	TouchableOpacity,
} from '../../../styles/components';
import LogBox from '../../../components/LogBox';
import lnd from 'react-native-lightning';

const LndLogs = ({ navigation }) => {
	const [content, setContent] = useState<string[]>([]);

	useEffect(() => {
		//Load contents of existing log file
		(async () => {
			if (content.length > 1) {
				return;
			}

			const logFileContentRes = await lnd.getLogFileContent(100);
			if (logFileContentRes.isErr()) {
				setContent((prevContent) => [
					...prevContent,
					`ERROR: Failed to load existing logs. ${logFileContentRes.error.message}`,
				]);
				return;
			}

			setContent((prevContent) => [...logFileContentRes.value, ...prevContent]);
		})();

		//Subscribe to any log file updates
		const listener = lnd.addLogListener((log) => {
			setContent((prevContent) => [...prevContent, log]);
		});

		return () => {
			lnd.removeLogListener(listener);
		};
	}, []);

	return (
		<View style={styles.container}>
			<TouchableOpacity
				activeOpacity={0.7}
				onPress={navigation.goBack}
				style={styles.row}>
				<Feather style={{}} name="arrow-left" size={30} />
				<Text style={styles.backText}>LND logs</Text>
			</TouchableOpacity>
			<LogBox data={content} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 10,
		paddingVertical: 8,
	},
	backText: {
		fontSize: 20,
	},
});

export default memo(LndLogs);