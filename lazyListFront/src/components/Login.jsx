import appDashboard from '../../public/dashboard.png'


const authEndPoint = "https://accounts.spotify.com/authorize";
const redirectUri = 'https://lazylist.onrender.com/'
const clientId = "caa4611ae28c4f7680d980488b12c723"

const scopes = [
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-read',
    'user-top-read',
]

const loginUrl = `${authEndPoint}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
)}`

function Login() {

    return(
    <div className="loginPage">
        <div className="loginHeader">
            <h1 className="loginTitle">LazyList</h1>
        </div>
        <div className="loginInfo">
            <h2 className="loginUnfortunate">Unfortunately, LazyList is still in development mode and is awaiting Spotify Approval to move into extended quote mode. Therefore only users that have been
                whitelisted are able to utlize the app. You can find more info about the app as well as pictures of the main client on my <a href="https://github.com/MattLangan123?tab=repositories">Github</a></h2>
            <a className="loginButton" href={loginUrl}>LOGIN WITH SPOTIFY</a>
        </div>
    </div>
    )

}

export default Login