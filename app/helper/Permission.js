import {Platform, PermissionsAndroid} from 'react-native';

/*export default function () {
    if (Platform.OS !== 'ios') {
        PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        ]);
    } else {

    }
};*/
export async function requestLocationPermissions() {
    if (Platform.OS === 'android') {
        const locationPermissionsGranted =
            (await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            )) &&
            (await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
            ));

        if (locationPermissionsGranted) {
            console.log('Location permissions already granted!');
            return;
        }

        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ]);
            if (
                granted.ACCESS_COARSE_LOCATION === PermissionsAndroid.RESULTS.GRANTED &&
                granted.ACCESS_FINE_LOCATION === PermissionsAndroid.RESULTS.GRANTED
            ) {
                console.log('You can now use location!');
            } else {
                console.log('Location permission declined :(');
            }
        } catch (err) {
            console.warn(err);
        }
    }
}
