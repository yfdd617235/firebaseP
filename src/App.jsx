import { UserRegister } from "./components/UserRegister";
import { UserLogin } from "./components/UserLogin";
import { Tasks } from "./components/Tasks";

function App() {


  return (
    <>
      <div className="App">FIREBASE</div>
      <UserLogin />
      <UserRegister />
      <Tasks />
    </>
  )
}

export default App
