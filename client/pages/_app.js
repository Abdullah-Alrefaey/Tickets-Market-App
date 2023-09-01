import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

// We define our own custom App Component
// Whenever Next loads up a page component, it wraps it up inside of App Component
const AppComponent = ({ Component, pageProps, currentUser }) => {
    return (
        <div>
            <Header currentUser={currentUser} />
            <div className="container">
                <Component currentUser={currentUser} {...pageProps} />
            </div>
        </div>
    );
};

// Get Some information that is common for every page (Information Fetching Ability)
// inside this method
// Next App is responsible for calling AppComponent.getInitialProps
AppComponent.getInitialProps = async (appContext) => {
    // console.log(appContext);
    const client = buildClient(appContext.ctx);
    const { data } = await client.get('/api/users/currentuser');

    // Check if the page does not have getInitialProps implemented in it
    // Manualy invoking the LandingPage's getInitialProps function
    let pageProps = {};
    if (appContext.Component.getInitialProps) {
        pageProps = await appContext.Component.getInitialProps(
            appContext.ctx,
            client,
            data.currentUser
        );
    }

    // console.log(pageProps);

    return {
        pageProps,
        // currentUser: data.currentUser, === ...data
        ...data,
    };
};

export default AppComponent;
