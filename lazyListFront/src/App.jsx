import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import './css/App.css'

  // URLSearchParams(window.location.search)gets url string after the '?' and .get() gets the code value from the url
  let code = new URLSearchParams(window.location.search).get('code')

function App() {

  return(
    <div className="app">
      {code ? <Dashboard code={code}/> : <Login/>}
    </div>
  )
}

export default App
