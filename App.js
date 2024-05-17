/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StatusBar,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import {Amplify} from 'aws-amplify';
import {generateClient} from 'aws-amplify/api';
const client = generateClient();

// Updated code
import {
  withAuthenticator,
  useAuthenticator,
} from '@aws-amplify/ui-react-native';
import {fetchUserAttributes} from 'aws-amplify/auth';
// Update code
import {getCarId, getUser} from './src/graphql/queries';
import {createCar} from './src/graphql/mutations';

import amplifyconfig from './src/amplifyconfiguration.json';
Amplify.configure(amplifyconfig);

function App() {
  // Sign out user
  // const { signOut } = useAuthenticator((context) => [context.user]);
  // signOut();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // This effect is triggered ONLY once when the app is started
  // Ask permission, only if location not enabled otherwise continue app
  useEffect(() => {
    if (Platform.OS === 'android') {
      androidPermission();
    } else {
      // IOS
      Geolocation.requestAuthorization();
    }
    updateUserCar();
  }, []);

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
    console.log(text);
  } else if (location) {
    // text contains the json object as string which contains the location details
    text = JSON.stringify(location);
    console.log('Current Geolocation: ', text);
  }

  const androidPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message:
            'Uber App needs access to your location ' +
            'so you can take awesome rides.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const updateUserCar = async () => {
    // Get authenticated user
    const authenticatedUser = await fetchUserAttributes({
      bypassCache: true,
    });
    if (!authenticatedUser) {
      return;
    }

    //Check if the user already has a car

    const carData = await client.graphql({
      query: getCarId,
      variables: {id: authenticatedUser.sub},
    });

    if (carData.data.getCar) {
      console.log('User already has a car assigned');
      return;
    }
    console.log('create new car');
    // If not, create a new car for the user
    const newCar = {
      id: authenticatedUser.sub,
      type: 'UberX',
      isActive: false,
      userId: authenticatedUser.sub,
    };

    await client.graphql({
      query: createCar,
      variables: {input: newCar},
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <HomeScreen />
      </SafeAreaView>
    </>
  );
}

export default withAuthenticator(App);
