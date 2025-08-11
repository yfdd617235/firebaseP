import { Auth } from './Auth'
import { useState, useEffect } from 'react'
import { db, auth, storage } from '../config/firebase'
import { getDocs, collection, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'

export const Tasks = () => {
    const [tasksList, setTasksList] = useState([]);

    // New task States
    const [newCustomer, setNewCustomer] = useState("");
    const [newTask, setNewTask] = useState("");
    const [newAmount, setNewAmount] = useState(0);
    const [newStatus, setNewStatus] = useState(false);

// File Upload State
const [fileUpload, setFileUpload] = useState(null);

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
                userId: auth?.currentUser?.uid,
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

const uploadFile = async () => {
    try {
       if(!fileUpload) return;
    const filesFolderRef = ref(storage, `projectFiles/${fileUpload.name}`);  
    await uploadBytes(filesFolderRef, fileUpload);
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
                    <div>
                        <input type="file" onChange={(e) => setFileUpload(e.target.files[0])}/>
                        <button onClick={uploadFile}>Upload file</button>
                    </div>
                </div>
            ))}</div>
        </div>

    )
}

