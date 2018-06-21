export function fetchWoeid(latitude, longitude) {
    return fetch('https://query.yahooapis.com/v1/public/yql?q=select%20woeid%20from%20geo.places%20where%20text%3D%22('
        + latitude + ',' + longitude + ')%22%20limit%201&format=json')
        .then((response) => {
            if (response.ok) {
                response.json()
            } else {
                throw Error(`Request rejected with status ${response.status}`);
            }
        })
        .then((responseJson) => responseJson.results.place.woeid)
        .catch((error) => {
            console.log(error.toString());
            //default to 1
            return 1
        })
}

export function fetchAuthTokens() {
    let param = {
        method: 'POST',
        headers: {
            'Authorization': 'Basic bmFqVlloNWRpM2VVYVUxTXZndndsVDUzTzpUSXpCQkMySlBuZVJhZzN0eEVEU0hOV2JoZXZ0YUppeUVtRTZqb2dsQ0NmMFA2c0ZqRw==',
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: 'grant_type=client_credentials',
    };
    fetch('https://api.twitter.com/oauth2/token', param)
        .then((response) => {
            if (response.ok) {
                response.json()
            } else {
                throw Error(`Request rejected with status ${response.status}`);
            }
        })
        .then((responseJson) => {
            return responseJson.access_token
        })
        .catch((error) => {
            console.log(error.toString())
        })
}

