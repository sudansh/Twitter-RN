import {StyleSheet} from "react-native";

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#4485f3',
        flexDirection: 'row',
        height: 50,
    },
    title: {
        color: 'white',
        padding: 10,
        fontSize: 22,
        textAlign: 'center'
    },
    spacing: {
        padding: 30,
    },
    button: {
        fontSize: 16,
        padding: 15,
        color: 'white',
    },
    wrapItem: {
        padding: 5,
        flex: 1,
        borderBottomWidth: 1,
        borderColor: '#e6e6e6',
        justifyContent: 'center',
    },
    center: {
        flexDirection:'column',
        alignItems: 'center'

    },
    retry: {
        padding: 20,
        width: 200,
        textAlign: 'center',
        color: 'white',
        backgroundColor: '#2196F3',

    },
    detailText: {
        fontSize: 22,
        color: '#4485f3',
        justifyContent: 'center',
        fontFamily: 'Cochin'
    },
    itemText: {
        fontSize: 20,
        padding: 12,
        justifyContent: 'center',
        color: '#4485f3'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 24
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        fontSize: 20,
        marginBottom: 5,
    },
});
export default styles