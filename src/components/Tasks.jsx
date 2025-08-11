import { Auth } from './Auth'
import { useState, useEffect } from 'react'
import { db } from '../config/firebase'
import { getDocs, collection, addDoc, deleteDoc, doc } from 'firebase/firestore'

export const Tasks = () => {
    const [tasksList, setTasksList] = useState([]);

    // New task States
    const [newCustomer, setNewCustomer] = useState("");
    const [newTask, setNewTask] = useState("");
    const [newAmount, setNewAmount] = useState(0);
    const [newStatus, setNewStatus] = useState(false);


    const tasksCollectionRef = collection(db, "Tasks");

    useEffect(() => {
        getTasksList();
    }, []);

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

    };

    //CREATE
    const onSubmitTask = async () => {
        try {
            await addDoc(tasksCollectionRef, {
                Customer: newCustomer,
                Task: newTask,
                Amount: newAmount,
                Status: newStatus,
            });
            getTasksList();
        } catch (err) {
            console.error(err)
        }
    };

    //DELETE
    const deleteTask = async (id) => {
        const taskDoc = doc(db, "Tasks", id);
        try {
            await deleteDoc(taskDoc);
            getTasksList()
        } catch (err) {
            console.error(err)
        }

    }

    return (
        <div>
            <div>
                <input
                    placeholder="Customer..."
                    onChange={(e) => setNewCustomer(e.target.value)}
                />
                <input
                    placeholder="Task..."
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <input
                    placeholder="Amount"
                    type='number'
                    onChange={(e) => setNewAmount(Number(e.target.value))}
                />
                <input
                    type="checkbox"
                    checked={newStatus}
                    onChange={(e) => setNewStatus(e.target.checked)}
                />
                <label> Approved </label>
                <button onClick={onSubmitTask}> Submit Task</button>
            </div>

            <div> tasks Here</div>
            <div>{tasksList.map((task) => (
                <div key={task.id}>
                    <h1> Customer: {task.Customer} {task.id}</h1>
                    <p>Task: {task.Task}</p>
                    <p>Status: {task.Status}</p>
                    <p>Amount: {task.Amount}</p>
                    <button onClick={() => deleteTask(task.id)}>Delete</button>
                </div>
            ))}</div>
        </div>

    )
}

