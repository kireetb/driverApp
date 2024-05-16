import React, {useState, useEffect, version, useRef} from 'react';
import {View, Text, Dimensions, Pressable} from 'react-native';
import MapView, {PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles.js';
import NewOrderPopup from '../../components/NewOrderPopup';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// Updated code
import {generateClient} from 'aws-amplify/api';
const client = generateClient();
import {fetchUserAttributes} from 'aws-amplify/auth';
// Updated code

import {listCars, listOrders} from '../../graphql/queries';
import {updateCar, updateOrder} from '../../graphql/mutations';

const origin = {latitude: 28.450927, longitude: -16.260845};
const destination = {latitude: 37.771707, longitude: -122.4053769};
const GOOGLE_MAPS_APIKEY = 'AIzaSyDoNKeY4ZDwL7Z0W93wDMha9MwXyoBKsVg';

const HomeScreen = () => {
  const [car, setCar] = useState({});
  const [myPosition, setMyPosition] = useState(null);
  const [order, setOrder] = useState(null);
  const [newOrders, setNewOrders] = useState([]);
  const mapViewRef = useRef(null);

  const fetchCar = async () => {
    try {
      // Updated code
      const userData = await fetchUserAttributes();
      const variables = {
        filter: {
          userId: {eq: userData.sub},
        },
      };
      const carData = await client.graphql({
        query: listCars,
        variables: variables,
      });
      // Updated code, picking only first object so assuming the driver has only 1 car
      setCar(carData.data.listCars.items[0]);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await client.graphql({
        query: listOrders,
        variables: {filter: {status: {eq: 'NEW'}}, type: {eq: car.type}},
      });
      setNewOrders(ordersData.data.listOrders.items);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCar();
    fetchOrders();
  }, []);

  const onDecline = () => {
    // setNewOrders(newOrders.slice(1));
    // Unset new orders to allow rerender and set car state
    setNewOrders([]);
    // Unset new orders to allow rerender and set car state
  };

  // Done
  const onAccept = async newOrder => {
    try {
      const variables = {
        input: {
          carId: car.id,
          status: 'PICKING_UP_CLIENT',
          id: newOrder.id,
          userId: newOrder.userId,
          type: car.type,
        },
      };
      const updateOrderData = await client.graphql({
        query: updateOrder,
        variables: variables,
      });
      setOrder(updateOrderData.data.updateOrder);
    } catch (e) {
      console.error(e);
    }

    // Pick only 1 order out of the muliple orders to server
    // setNewOrders(newOrders.slice(1));
  };

  const onGoPress = async () => {
    // Update the car and set it to active
    try {
      const userData = await fetchUserAttributes();
      const variables = {
        input: {
          id: car.id,
          userId: userData.sub,
          isActive: !car.isActive,
        },
      };
      const updatedCarData = await client.graphql({
        query: updateCar,
        variables: variables,
      });
      setCar(updatedCarData.data.updateCar);
    } catch (e) {
      console.error(e);
    }
  };

  const onUserLocationChange = async event => {
    const {latitude, longitude, heading} = event.nativeEvent.coordinate;
    // Update the car and set it to active
    try {
      const userData = await fetchUserAttributes();
      const variables = {
        input: {
          id: car.id,
          userId: userData.sub,
          latitude,
          longitude,
          heading,
        },
      };
      const updatedCarData = await client.graphql({
        query: updateCar,
        variables: variables,
      });
      setCar(updatedCarData.data.updateCar);
    } catch (e) {
      console.error(e);
    }
  };

  const onDirectionFound = event => {
    console.log('Direction found:');
    // ??? get username from orders table using the model relationship
    console.log(order);
    console.log(car);
    if (order) {
      setOrder({
        ...order,
        distance: event.distance,
        duration: event.duration,
        pickedUp: order.pickedUp || event.distance < 0.2,
        isFinished: order.pickedUp && event.distance < 0.2,
      });
      mapViewRef.current.fitToCoordinates(event.coordinates, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  };

  const getDestination = () => {
    if (order && order.pickedUp) {
      return {
        latitude: order.destLatitude,
        longitude: order.destLongitude,
      };
    }
    return {
      latitude: order.originLatitude,
      longitude: order.originLongitude,
    };
  };

  const renderBottomTitle = () => {
    if (order && order.isFinished) {
      return (
        <View style={{alignItems: 'center'}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#cb1a1a',
              width: 200,
              padding: 10,
            }}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>
              COMPLETE {order.type}
            </Text>
          </View>
          <Text style={styles.bottomText}>{order.user.username}</Text>
        </View>
      );
    }

    if (order && order.pickedUp) {
      return (
        <View style={{alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: 'black'}}>{order.duration ? order.duration.toFixed(1) : '?'} min</Text>
            <View
              style={{
                backgroundColor: '#d41212',
                marginHorizontal: 10,
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
              }}>
              <FontAwesome name={'user'} color={'white'} size={20} />
            </View>
            <Text style={{color: 'black'}}>{order.distance ? order.distance.toFixed(1) : '?'} km</Text>
          </View>
          <Text style={styles.bottomText}>
            Dropping off {order?.user?.username}
          </Text>
        </View>
      );
    }

    if (order) {
      return (
        <View style={{alignItems: 'center'}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{color: 'black'}}>{order.duration ? order.duration.toFixed(1) : '?'} min</Text>
            <View
              style={{
                backgroundColor: '#1e9203',
                marginHorizontal: 10,
                width: 30,
                height: 30,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
              }}>
              <FontAwesome name={'user'} color={'white'} size={20} />
            </View>
            <Text style={{color: 'black'}}>{order.distance ? order.distance.toFixed(1) : '?'} km</Text>
            {/* <Text style={{color: 'black'}}> km</Text> */}
          </View>
          <Text style={styles.bottomText}>
            Picking up {order?.user?.username}
          </Text>
        </View>
      );
    }
    if (car?.isActive) {
      return <Text style={styles.bottomText}>You're online</Text>;
    }
    return <Text style={styles.bottomText}>You're offline</Text>;
  };

  return (
    <View>
      <MapView
        ref={mapViewRef}
        style={{width: '100%', height: Dimensions.get('window').height - 150}}
        provider={PROVIDER_GOOGLE}
        showsUserLocation={!!car?.isActive}
        onUserLocationChange={onUserLocationChange}
        initialRegion={{
          latitude: 28.450627,
          longitude: -16.263045,
          latitudeDelta: 0.0222,
          longitudeDelta: 0.0121,
        }}>
        {order && (
          <MapViewDirections
            origin={{
              latitude:  car?.latitude,
              longitude:  car?.longitude,
            }}
            onReady={onDirectionFound}
            destination={getDestination()}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor="black"
            onError={errorMessage => {
              console.error(errorMessage);
            }}
          />
        )}
      </MapView>

      <Pressable
        onPress={() => console.warn('Balance')}
        style={styles.balanceButton}>
        <Text style={styles.balanceText}>
          <Text style={{color: 'green'}}>$</Text> 0.00
        </Text>
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hey')}
        style={[styles.roundButton, {top: 10, left: 10}]}>
        <Entypo name={'menu'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hey')}
        style={[styles.roundButton, {top: 10, right: 10}]}>
        <Entypo name={'menu'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hey')}
        style={[styles.roundButton, {bottom: 110, left: 10}]}>
        <Entypo name={'menu'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable
        onPress={() => console.warn('Hey')}
        style={[styles.roundButton, {bottom: 110, right: 10}]}>
        <Entypo name={'menu'} size={24} color="#4a4a4a" />
      </Pressable>

      <Pressable onPress={onGoPress} style={styles.goButton}>
        <Text style={styles.goText}>{car?.isActive ? 'END' : 'GO'}</Text>
      </Pressable>

      <View style={styles.bottomContainer}>
        <Ionicons name={'options'} size={30} color="#4a4a4a" />
        {renderBottomTitle()}
        <Entypo name={'menu'} size={30} color="#4a4a4a" />
      </View>

      {newOrders.length > 0 && !order && car?.isActive && (
        <NewOrderPopup
          newOrder={newOrders[0]}
          duration={2}
          distance={0.5}
          onDecline={onDecline}
          onAccept={() => onAccept(newOrders[0])}
        />
      )}
    </View>
  );
};

export default HomeScreen;
