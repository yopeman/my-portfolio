import { WebView } from 'react-native-webview';
import { StyleSheet } from 'react-native';

export default function Index() {
  return (
    <WebView
      style={styles.container}
      originWhitelist={['*']}
      source={{ uri: 'file:///android_asset/html/index.html' }}
      dom={{ matchContents: true }}

    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});