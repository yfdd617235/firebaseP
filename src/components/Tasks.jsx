import { Auth } from './Auth'
import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { getDocs, collection } from 'firebase/firestore'

export const Tasks = () => {
    const [tasksList, setTasksList] = useState([]);
    const tasksCollectionRef = collection(db, "Tasks");

    useEffect(() => {
        const getTasksList = async () => {
            //Read Data
            //Set the movie https://www.youtube.com/watch?v=2hR-uWjBAgw 47:57
            try {
                const data = await getDocs(tasksCollectionRef);
                const filteredData = data.docs.map((doc) => ({
                    ...doc.data(),
                    id: doc.id,
                }));
                // console.log(filteredData);
                setTasksList(filteredData)
            } catch (err) {
                console.error(err)
            }

        }
        getTasksList();
    }, []);

    return (
        <div>

            <div> tasks Here</div>
            <div>{tasksList.map((task) => (
                <div key={task.id}> 
                    <h1> Customer: {task.Customer} {task.id}</h1>
                    <p>Status: {task.Status}</p>
                    <p>Amount: {task.Amount}</p>
                </div>
            ))}</div>
        </div>

    )
}

