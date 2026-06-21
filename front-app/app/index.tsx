import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function Index() {  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style='light' backgroundColor="#000000" />
      <WebView
        originWhitelist={['*']}
        source={{ uri: 'https://yohanesdbb.vercel.app/' }}
        dom={{ matchContents: true }}
      />
    </SafeAreaView>
  );
}