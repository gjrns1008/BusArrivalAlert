const { publishAAB } = require('google-playstore-publisher');

const keyFilePath = './play-account.json';
const packageName = 'com.busarrivalalert_rn'; // 앱 패키지 이름 확인 필요
const track = 'internal'; // 또는 'beta', 'alpha', 'internal', 'production'
const filePath = './android/app/build/outputs/bundle/release/app-release.aab';

publishAAB({ keyFilePath, packageName, track, filePath })
  .then(res => {
    console.log('Upload successful!');
    console.log('Version code:', res.versionCode);
    console.log('Edit ID:', res.editId);
    console.log('Published:', res.published);
  })
  .catch(err => {
    console.error('Upload failed:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  });
