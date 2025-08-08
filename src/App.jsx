
import { Auth } from "./components/Auth";
import {Tasks} from "./components/tasks";
import {db} from "./config/firebase";

function App() {
 

  return (
    <>
      <div className="App">FIREBASE</div>
      <Auth/>
      <Tasks/>
    </>
  )
}

export default App
