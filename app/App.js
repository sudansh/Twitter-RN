import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
    ToastAndroid,
    Platform,
    Button,
    AsyncStorage,
    View
} from 'react-native';
import styles from './styles'
import {requestLocationPermissions} from './helper/Permission'
import Storage from 'react-native-storage';

var storage = new Storage({
    // Use AsyncStorage for RN, or window.localStorage for web.
    // If not set, data would be lost after reload.
    storageBackend: AsyncStorage,
    // if data was not found in storage or expired,
    // the corresponding sync method will be invoked and return
    // the latest data.
    sync: {}
});
global.storage = storage;
export default class App extends Component {

    constructor(props) {
        console.log('in constructor');
        super(props);
        this.state = {
            access_token: null,
            success: false,
            trends: null,
            error: false,
            errorMessage: null,
            triggerTrendFunction: true,
            cache: null,
            woeid: 1,
        };
        if (Platform.OS === 'android') {
            requestLocationPermissions()
        }
    }

    //Initialize state variables with saved values.
    initState() {
        storage.load({
            key: "WOEID",
        }).then(response => {
            this.state.woeid = response
        }).catch((e) => {

        });
        storage.load({
            key: "TRENDS",
        }).then(response => {
            this.state.treds = response
        }).catch((e) => {

        });
        storage.load({
            key: "ACCESSTOKEN",
        }).then(response => {
            this.state.access_token = response
        }).catch((e) => {

        });
    }


    componentDidMount() {
        this.initState()
        this.getLocation()
    }

    /**
     * Fetch current location
     * @returns {Promise<void>}
     */
    async getLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("location" + position.coords.latitude + "," + position.coords.longitude);
                this.getWoeid(position.coords.latitude, position.coords.longitude);
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: false,
                });
            },
            (error) => {
                console.log("location error" + error.toString());
                this.setState({success: false, error: true, errorMessage: `Error fetching location ${error.message}`});
            },
            {enableHighAccuracy: false, timeout: 5000, maximumAge: 1000},
        );
    }

    /**
     * Fetch yahoo woeid from lat long
     * @param latitude
     * @param longitude
     * @returns {Promise<void>}
     */
    async getWoeid(latitude, longitude) {
        try {
            let url = 'https://query.yahooapis.com/v1/public/yql?q=select%20woeid%20from%20geo.places%20where%20text%3D%22('
                + latitude + ',' + longitude + ')%22%20limit%201&format=json';
            console.log(url);
            let apiCall = await fetch(url);
            let resp = await apiCall.json();
            console.log(`yahooid :${JSON.stringify(resp)}`)
            console.log("yahooid: " + resp.query.results.place.woeid);
            this.state.woeid = resp.query.results.place.woeid;
            storage.save({
                key: "WOEID",
                data: resp.query.results.place.woeid
            });
            this.getTrends()
        } catch (e) {
            this.setState({success: false, error: true, errorMessage: `Error fetching location. ${e.message}`});
            console.log(e)
        }
    }

    async componentWillMount() {
        try {
            let param = {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic bmFqVlloNWRpM2VVYVUxTXZndndsVDUzTzpUSXpCQkMySlBuZVJhZzN0eEVEU0hOV2JoZXZ0YUppeUVtRTZqb2dsQ0NmMFA2c0ZqRw==',
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                body: 'grant_type=client_credentials',
            };
            let apiCall = await fetch('https://api.twitter.com/oauth2/token', param);
            let resp = await apiCall.json();
            this.setState({access_token: resp.access_token, success: true});
            storage.save({
                key: "ACCESSTOKEN",
                data: resp.access_token
            });
            ToastAndroid.show(`Getting data as fast as we can!`, ToastAndroid.TOP);
        }
        catch (e) {
            this.setState({
                success: false, error: true,
                errorMessage: `Error fetching Twitter token. ${e.message}`,
                triggerTrendFunction: false
            });
            ToastAndroid.show(this.state.errorMessage, ToastAndroid.TOP)
        }
    }

    /**
     * Fetch twitter trends
     * @returns {Promise<void>}
     */
    async getTrends() {
        if (this.state.woeid == null || this.state.woeid <= 0) {
            //if we are unable to fetch location/woeid, show global trends.
            this.state.woeid = 1
        }
        let {access_token, trends, woeid} = this.state;
        try {
            let param = {
                method: 'GET',
                headers: {
                    'Authorization': `bearer ${access_token}`,
                }
            };
            let woeid = this.state.woeid; //HARDCODE woeid here
            let apiCall = await fetch(`https://api.twitter.com/1.1/trends/place.json?id=${woeid}`, param);
            let resp = await apiCall.json();
            if ('errors' in resp) {
                throw resp.errors[0]
            } else {
                this.setState({
                    trends: resp[0].trends,
                    triggerTrendFunction: false
                });
                ToastAndroid.show(`Latest Trends pulled!`, ToastAndroid.TOP)
            }
        }
        catch (e) {
            this.setState({
                error: true,
                errorMessage: `Error fetching trends. ${e.message}`,
                triggerTrendFunction: false
            });
            ToastAndroid.show(this.state.errorMessage, ToastAndroid.TOP)
        }
    }

    /**
     * Render twitter trends
     * @returns {*}
     */
    renderFeeds() {
        let {triggerTrendFunction} = this.state;
        return (
            <View>
                <View style={styles.header}>
                    <Text style={styles.title}>#Trending Places</Text>
                </View>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={triggerTrendFunction}
                            onRefresh={() => {
                                this.setState({triggerTrendFunction: true});
                                this.getTrends();
                            }}
                            progressBackgroundColor='white'
                            colors={['indigo', 'blue', 'green', 'blue']}
                        />
                    }
                >
                    {
                        this.state.trends.map((item, k) => {
                            return <TouchableOpacity key={k} style={styles.wrapItem}>
                                <Text style={styles.itemText}
                                >{item.name}</Text></TouchableOpacity>
                        })
                    }
                </ScrollView>

            </View>
        );
    }

    /**
     * Render loading
     * @returns {*}
     */
    renderAnimation() {
        return (<ActivityIndicator size={70} color={'indigo'} animating={true}/>);
    }


    /**
     * Retry fetching trends again
     */
    retry() {
        this.getLocation()
    }

    render() {
        let {error, success, triggerTrendFunction, errorMessage, trends} = this.state;
        if (success && triggerTrendFunction) {
            this.getTrends();
        }
        if (error && trends == null) {
            return (
                <View style={styles.container}>
                    <Text style={styles.instructions}>{this.state.errorMessage}</Text>
                    <TouchableOpacity
                        onPress={() => this.retry()}>
                        <View style={styles.center}>
                            <Text style={styles.retry}>Retry</Text>
                        </View>
                    </TouchableOpacity>

                </View>
            );
        }
        if (trends == null) {
            return (
                <View style={styles.container}>{this.renderAnimation()}</View>
            )
        }

        return (
            <View style={styles.container}>
                {this.renderFeeds()}
            </View>
        );
    }
}

AppRegistry.registerComponent('App', () => App);