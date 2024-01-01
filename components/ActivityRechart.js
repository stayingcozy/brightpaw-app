import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { db, auth } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, limit, doc } from 'firebase/firestore';

// https://recharts.org/en-US/examples/SimpleLineChart

const ActivityRechart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Check local storage for cached data
    const cachedData = localStorage.getItem('activityData');
    if (cachedData) {
      setData(JSON.parse(cachedData));
    } else {
      // Fetch data from Firebase and set it to state
      const uid = auth.currentUser.uid;
      const actRef = collection(db, 'users', `${uid}`, 'activity');
      const q = query(actRef, limit(100), orderBy('timestamp', 'desc'));
  
      const unsubscribe = onSnapshot(q, (docSnap) => {
        if (!docSnap.metadata.hasPendingWrites) {
            var newData = docSnap.docs.map((doc) => doc.data()).reverse()
            setData(newData);

            // Cache the data in local storage
            localStorage.setItem('activityData', JSON.stringify(newData));
        }
      });

    }
  }, []);

  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="timestamp" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="person" stroke="#8884d8" />
      <Line type="monotone" dataKey="dog" stroke="#82ca9d" />
      <Line type="monotone" dataKey="cat" stroke="#ffc658" />
    </LineChart>
  );
};

export default ActivityRechart;
